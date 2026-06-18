'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { 
  FolderX,
  Search, 
  X,
  AlertCircle,
  Undo2
} from 'lucide-react'
import Link from 'next/link'

import { Badge, Button, Card } from '../../../components/ui'
import { fetchHiddenProjects, unhideProject } from '../../../lib/api'
import { formatDate } from '../../../lib/date'
import type { Project } from '../../../types'

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchHiddenProjects()
      setProjects(data || [])
    } catch (err) {
      console.error('Failed to load hidden projects:', err)
      toast.error('숨겨진 프로젝트를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleUnhide = async (projectId: string) => {
    if (!confirm('해당 프로젝트의 숨김을 해제하시겠습니까?\n해제 시 일반 유저들에게 다시 노출됩니다.')) return

    try {
      await unhideProject(projectId)
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
      toast.success('프로젝트 숨김이 해제되었습니다.')
    } catch (err) {
      console.error('Failed to unhide project:', err)
      toast.error('숨김 해제에 실패했습니다.')
    }
  }

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    p.leader.name.toLowerCase().includes(searchKeyword.toLowerCase())
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-slate-500">
        프로젝트 정보를 불러오는 중...
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
          <FolderX className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">프로젝트 관리</h1>
          <p className="text-slate-500 text-sm mt-1">
            신고 처리 등으로 인해 숨겨진 프로젝트 목록을 관리합니다.
          </p>
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-medium text-slate-600 bg-slate-100 px-4 py-2 rounded-lg">
          숨겨진 프로젝트: <span className="text-orange-600 font-bold">{projects.length}</span>건
        </div>

        <div className="relative flex items-center w-full max-w-xs">
          <div className="absolute left-3 text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="제목 또는 리더명으로 검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
          />
          {searchKeyword && (
            <button
              type="button"
              onClick={() => setSearchKeyword('')}
              className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <p className="text-slate-500 font-medium">
            {searchKeyword ? '검색 결과가 없습니다.' : '현재 숨겨진 프로젝트가 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="h-1.5 w-full bg-orange-400" />
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-100">
                      HIDDEN
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-medium">
                      생성일: {formatDate(project.createdAt)}
                    </span>
                  </div>

                  <div className="mb-4">
                    <Link href={`/projects/${project.id}`} className="group">
                      <h3 className="font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">
                        {project.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4 mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-white shadow-sm">
                        {project.leader.avatar ? (
                          <img src={project.leader.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                            <Undo2 size={14} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {project.leader.name}
                        </div>
                        <div className="text-[10px] text-slate-500">리더</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="gradient"
                      size="sm"
                      className="w-full h-9 text-xs"
                      onClick={() => handleUnhide(project.id)}
                    >
                      <Undo2 size={14} className="mr-1.5" />
                      숨김 해제
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
