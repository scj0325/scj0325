'use client'

import { useEffect, useState } from 'react';



import { useRouter } from 'next/navigation';



import { Briefcase, Trash2 } from 'lucide-react';



import { PaginationControls } from '../../../components/PaginationControls';
import { Badge, Button, Card } from '../../../components/ui';














type ProjectSubTab =
  | 'uploaded'
  | 'participating'
  | 'applied'
  | 'completed'
  | 'viewed'

interface MyPageProjectResponse {
  id: number
  title: string
  description: string
  deadline: string
  leaderNickname: string
  leaderId: number
  recruitingPositions: string[]
  techStacks: string[]
  statusText: string
}

interface ProjectTabProps {
  user: any
}

const statusConfig: Record<string, { text: string; className: string }> = {
  RECRUITING: {
    text: '모집 중',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  IN_PROGRESS: {
    text: '진행 중',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  COMPLETED: {
    text: '완료',
    className: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  DISBANDED: {
    text: '해산',
    className: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  CANCELLED: {
    text: '취소',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export default function ProjectTab({ user }: ProjectTabProps) {
  const router = useRouter()
  const [activeProjectSubTab, setActiveProjectSubTab] =
    useState<ProjectSubTab>('uploaded')
  const [projects, setProjects] = useState<MyPageProjectResponse[]>([])
  const [contentLoading, setContentLoading] = useState(false)

  // 🎯 서버 페이징 관리를 위한 전용 상태 필드
  const [page, setPage] = useState(0)
  const [pageCount, setPageCount] = useState(0)

  useEffect(() => {
    if (!user) return

    const endpointMap: Record<ProjectSubTab, string> = {
      uploaded: `${API_BASE}/mypage/projects/owned`,
      participating: `${API_BASE}/mypage/projects/participating`,
      applied: `${API_BASE}/mypage/projects/applied`,
      completed: `${API_BASE}/mypage/projects/completed`,
      viewed: `${API_BASE}/mypage/projects/recent-views`,
    }

    setContentLoading(true)

    // 🎯 백엔드 페이징 파라미터 매핑 추가
    fetch(`${endpointMap[activeProjectSubTab]}?page=${page}&size=5`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.code === '200' && res.data) {
          setProjects(res.data.content || [])
          setPageCount(res.data.totalPages || 0)
        } else {
          setProjects([])
          setPageCount(0)
        }
      })
      .catch(() => {
        setProjects([])
        setPageCount(0)
      })
      .finally(() => setContentLoading(false))
  }, [activeProjectSubTab, page, user])

  // 서브 탭 변경 시 페이지 0번으로 리셋
  useEffect(() => {
    setPage(0)
  }, [activeProjectSubTab])

  // 🎯 누락되었던 최근 본 내역 삭제 함수 원본 복구
  const handleDeleteRecentView = async (
    projectId: number,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation()
    if (!confirm('최근 본 프로젝트 내역에서 삭제하시겠습니까?')) return
    try {
      const res = await fetch(
        `${API_BASE}/mypage/projects/recent-views/${projectId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      )
      const result = await res.json()
      if (result.code === '200') {
        setProjects((prev) => prev?.filter((p) => p.id !== projectId))
      }
    } catch (err) {
      alert('삭제 처리에 실패했습니다.')
    }
  }

  // 🎯 누락되었던 프로젝트 지원 신청 취소 함수 원본 복구
  const handleCancelApplication = async (
    applicationId: number,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation()
    if (!confirm('프로젝트 지원 신청을 취소하시겠습니까?')) return
    try {
      const res = await fetch(
        `${API_BASE}/mypage/projects/applications/${applicationId}/cancel`,
        {
          method: 'PATCH',
          credentials: 'include',
        },
      )
      const result = await res.json()
      if (result.code === '200') {
        alert(result.message)
        setProjects((prev) => prev?.filter((p) => p.id !== applicationId))
      }
    } catch (err) {
      alert('지원 취소 처리에 실패했습니다.')
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-4 overflow-x-auto">
        {[
          { id: 'uploaded', label: '내가 올린 프로젝트' },
          { id: 'participating', label: '내가 참여중인 프로젝트' },
          { id: 'applied', label: '내가 지원한 프로젝트' },
          { id: 'completed', label: '내가 수행한 프로젝트' },
          { id: 'viewed', label: '조회 목록' },
        ].map((subTab) => (
          <button
            key={subTab.id}
            onClick={() => setActiveProjectSubTab(subTab.id as ProjectSubTab)}
            className={`tab-pill transition-colors ${
              activeProjectSubTab === subTab.id
                ? 'tab-pill-active'
                : 'tab-pill-inactive hover:bg-slate-200'
            }`}
          >
            {subTab.label}
          </button>
        ))}
      </div>

      {contentLoading ? (
        <div className="text-center py-12 text-slate-400">
          데이터 로딩 중...
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {projects.map((proj) => {
            const currentStatus = statusConfig[proj.statusText] || {
              text: proj.statusText || '알 수 없음',
              className: 'bg-slate-100 text-slate-600 border-slate-200',
            }

            return (
              <div
                key={proj.id}
                onClick={() => router.push(`/projects/${proj.id}`)}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex justify-between items-start gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${currentStatus.className}`}
                    >
                      {currentStatus.text}
                    </span>
                    <span className="text-xs text-slate-400">
                      마감일: {proj.deadline || '상시'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors">
                    {proj.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2">
                    {proj.description}
                  </p>
                  {proj.techStacks.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.techStacks.map((st) => (
                        <Badge key={st} variant="secondary" className="text-xs">
                          {st}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  {activeProjectSubTab === 'viewed' && (
                    <button
                      onClick={(e) => handleDeleteRecentView(proj.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {activeProjectSubTab === 'applied' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-red-500 border-red-200 hover:bg-red-50"
                      onClick={(e) => handleCancelApplication(proj.id, e)}
                    >
                      지원 취소
                    </Button>
                  )}
                </div>
              </div>
            )
          })}

          {/* 하단 페이지네이션 컴포넌트 마운트 */}
          <div className="mt-8 flex justify-center w-full">
            <PaginationControls
              page={page}
              pageCount={pageCount}
              onPageChange={setPage}
            />
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            해당하는 프로젝트가 없습니다
          </h3>
          <p className="text-slate-500 mb-6">
            새로운 프로젝트를 찾거나 직접 만들어보세요.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => router.push('/projects')}>
              프로젝트 찾기
            </Button>
            <Button onClick={() => router.push('/projects/new')}>
              프로젝트 만들기
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
