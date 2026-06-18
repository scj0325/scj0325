'use client'

// 이 페이지는 빌드할 때 미리 굽지 말고, 무조건 실서버에서 동적으로 렌더링하라고 강제하는 설정
export const dynamic = 'force-dynamic'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import {
  Briefcase,
  BookOpen,
  ChevronRight,
  ExternalLink,
  Figma,
  FileText,
  Github,
  Globe,
  Linkedin,
  MessageSquare,
  Pencil,
} from 'lucide-react'

import { Badge, Button, Card } from '../../components/ui'
import type { Portfolio } from '../../types'
import { formatPositionLabel } from '../../constants/project'
import { fetchMyPortfolio, withdrawMember } from '../../lib/api'
import { useAuth } from '../providers'
import ProjectTab from './components/ProjectTab'
import ProposalTab from './components/ProposalTab'

const LINK_META: Record<string, { label: string; icon: React.ReactNode }> = {
  GITHUB:        { label: 'GitHub',       icon: <Github className="w-4 h-4" /> },
  BLOG:          { label: '블로그',        icon: <BookOpen className="w-4 h-4" /> },
  DEPLOY:        { label: '배포 URL',      icon: <Globe className="w-4 h-4" /> },
  FIGMA:         { label: 'Figma',        icon: <Figma className="w-4 h-4" /> },
  BEHANCE:       { label: 'Behance',      icon: <Globe className="w-4 h-4" /> },
  PORTFOLIO_URL: { label: '포폴 URL',     icon: <Globe className="w-4 h-4" /> },
  NOTION:        { label: '노션',          icon: <Globe className="w-4 h-4" /> },
  LINKEDIN:      { label: '링크드인',      icon: <Linkedin className="w-4 h-4" /> },
}

type Tab = 'portfolio' | 'project' | 'proposal'
type PortfolioSubTab = 'portfolio' | 'peerReview'

export default function MyPage() {
  const { user, loading: authLoading, logout } = useAuth()
  const router = useRouter()

  const activeTabFromStorage =
    typeof window !== 'undefined' ? localStorage.getItem('mypage_tab') : null
  const [activeTab, setActiveTab] = useState<Tab>(
    (activeTabFromStorage as Tab) || 'portfolio',
  )
  const [activePortfolioSubTab, setActivePortfolioSubTab] =
    useState<PortfolioSubTab>('portfolio')

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [portfolioLoading, setPortfolioLoading] = useState(true)
  const [avatarError, setAvatarError] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [newNickname, setNewNickname] = useState('')
  const [nicknameError, setNicknameError] = useState('')
  const [nicknameLoading, setNicknameLoading] = useState(false)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

  const handleProfileEdit = async () => {
    if (!newNickname.trim()) {
      setNicknameError('닉네임을 입력해주세요.')
      return
    }
    setNicknameLoading(true)
    setNicknameError('')
    try {
      const res = await fetch(`${API_BASE}/members/me/nickname`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: newNickname.trim() }),
      })
      const json = await res.json()
      if (json.code === '200') {
        setShowProfileModal(false)
        window.location.reload()
      } else {
        setNicknameError(json.message)
      }
    } catch {
      setNicknameError('서버 오류가 발생했습니다.')
    } finally {
      setNicknameLoading(false)
    }
  }

  const handleWithdraw = async () => {
    setWithdrawing(true)
    try {
      await withdrawMember()
      await logout()
      router.push('/')
    } catch {
      setWithdrawing(false)
      setShowWithdrawModal(false)
    }
  }

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    if (typeof window !== 'undefined') localStorage.setItem('mypage_tab', tab)
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/')
      return
    }
    if (!authLoading && user) {
      fetchMyPortfolio()
        .then((data) => setPortfolio(data))
        .catch(() => setPortfolio(null))
        .finally(() => setPortfolioLoading(false))
    }
  }, [authLoading, user, router])

  if (authLoading)
    return (
      <div className="container mx-auto px-4 py-20 text-center text-slate-500">
        로딩 중...
      </div>
    )
  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          {user?.profileImageUrl && !avatarError ? (
            <img
              src={user.profileImageUrl}
              alt="My Profile"
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-md flex items-center justify-center text-2xl font-bold text-slate-600">
              {user?.nickname?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            {user?.nickname ?? '...'}
          </h1>
          {portfolio && (
            <>
              <p className="text-slate-500 mb-3">{formatPositionLabel(portfolio.desiredPosition)}</p>
              {portfolio.techStacks.length > 0 && (
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {portfolio.techStacks.map((stack) => (
                    <Badge key={stack} variant="secondary">
                      {stack}
                    </Badge>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none gap-2" onClick={() => { setNewNickname(''); setNicknameError(''); setShowProfileModal(true) }}>
            <Pencil className="w-4 h-4" /> 프로필 수정
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar / Tabs */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-24">
            <div className="flex md:flex-col border-b md:border-b-0 border-slate-200">
              <button
                onClick={() => handleTabChange('portfolio')}
                className={`flex-1 md:w-full text-left px-6 py-4 font-medium flex items-center justify-between ${activeTab === 'portfolio' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" /> 포트폴리오
                </span>
                <ChevronRight className="w-4 h-4 hidden md:block opacity-50" />
              </button>
              <button
                onClick={() => handleTabChange('project')}
                className={`flex-1 md:w-full text-left px-6 py-4 font-medium flex items-center justify-between ${activeTab === 'project' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> 프로젝트
                </span>
                <ChevronRight className="w-4 h-4 hidden md:block opacity-50" />
              </button>
              <button
                onClick={() => handleTabChange('proposal')}
                className={`flex-1 md:w-full text-left px-6 py-4 font-medium flex items-center justify-between ${activeTab === 'proposal' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> 제안/지원
                </span>
                <ChevronRight className="w-4 h-4 hidden md:block opacity-50" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Panel */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'portfolio' && (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex gap-2 mb-6 border-b border-slate-200 pb-4 overflow-x-auto">
                  <button
                    onClick={() => setActivePortfolioSubTab('portfolio')}
                    className={`tab-pill ${activePortfolioSubTab === 'portfolio' ? 'tab-pill-active' : 'tab-pill-inactive'}`}
                  >
                    포트폴리오
                  </button>
                  <button
                    onClick={() => setActivePortfolioSubTab('peerReview')}
                    className={`tab-pill ${activePortfolioSubTab === 'peerReview' ? 'tab-pill-active' : 'tab-pill-inactive'}`}
                  >
                    내게 달린 피어리뷰
                  </button>
                </div>
                {activePortfolioSubTab === 'peerReview' && (
                  <Card className="p-12 text-center border-dashed">
                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">
                      피어리뷰 확인하기
                    </h3>
                    <p className="text-slate-500 mb-6">
                      프로젝트 동료들이 남겨준 소중한 피드백들을 확인해보세요.
                    </p>
                    <Link href="/mypage/reviews">
                      <Button variant="outline" className="gap-2">
                        내 리뷰 목록 보기 <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </Card>
                )}
                {activePortfolioSubTab === 'portfolio' &&
                  (portfolioLoading ? (
                    <div className="text-center py-12 text-slate-400">
                      로딩 중...
                    </div>
                  ) : portfolio ? (
                    <Card className="p-6 space-y-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">{portfolio.title}</h2>
                          {portfolio.desiredPosition && (
                            <p className="text-sm text-blue-600 mt-1">{formatPositionLabel(portfolio.desiredPosition)}</p>
                          )}
                        </div>
                        <Link href="/mypage/portfolio/edit">
                          <Button size="sm" variant="outline" className="gap-1.5">
                            <Pencil className="w-3.5 h-3.5" /> 수정
                          </Button>
                        </Link>
                      </div>

                      {portfolio.introduction && (
                        <p className="text-slate-600 text-sm leading-relaxed">{portfolio.introduction}</p>
                      )}

                      {portfolio.techStacks && portfolio.techStacks.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-500">기술 스택</h4>
                          <div className="flex flex-wrap gap-2">
                            {portfolio.techStacks.map((stack) => (
                              <Badge key={stack} variant="secondary">{stack}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {portfolio.links && portfolio.links.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-500">링크</h4>
                          <div className="flex flex-wrap gap-4">
                            {portfolio.links.map((link) => {
                              const meta = LINK_META[link.linkType] ?? { label: link.linkType, icon: <Globe className="w-4 h-4" /> }
                              return (
                                <a
                                  key={link.linkType}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                                >
                                  {meta.icon}
                                  {meta.label}
                                  <ExternalLink className="w-3 h-3 opacity-50" />
                                </a>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      <div>
                        {portfolio.isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                            공개
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
                            비공개
                          </span>
                        )}
                      </div>
                    </Card>
                  ) : (
                    <Card className="p-12 text-center border-dashed">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">
                        등록된 포트폴리오가 없습니다
                      </h3>
                      <Link href="/mypage/portfolio/new">
                        <Button>포트폴리오 등록하기</Button>
                      </Link>
                    </Card>
                  ))}
              </motion.div>
            )}

            {activeTab === 'project' && <ProjectTab user={user} />}
            {activeTab === 'proposal' && <ProposalTab user={user} />}
          </AnimatePresence>

          <div className="mt-12 pt-8 border-t border-slate-200 text-center md:text-right">
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="text-sm text-slate-400 hover:text-red-500 underline underline-offset-4 transition-colors"
            >
              회원 탈퇴
            </button>
          </div>
        </div>
      </div>
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4">
            <h2 className="text-lg font-bold text-slate-900 mb-2">프로필 수정</h2>
            <p className="text-sm text-slate-500 mb-4">변경할 닉네임을 입력해주세요.</p>
            <input
              type="text"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              placeholder={user?.nickname ?? ''}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleProfileEdit()}
            />
            {nicknameError && (
              <p className="text-xs text-red-500 mb-3">{nicknameError}</p>
            )}
            <div className="flex gap-3 justify-end mt-4">
              <Button variant="outline" onClick={() => setShowProfileModal(false)} disabled={nicknameLoading}>
                취소
              </Button>
              <Button onClick={handleProfileEdit} disabled={nicknameLoading}>
                {nicknameLoading ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4">
            <h2 className="text-lg font-bold text-slate-900 mb-2">회원 탈퇴</h2>
            <p className="text-sm text-slate-500 mb-6">
              탈퇴하면 모든 데이터가 삭제되며 복구할 수 없습니다. 정말 탈퇴하시겠습니까?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowWithdrawModal(false)}
                disabled={withdrawing}
              >
                취소
              </Button>
              <Button
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {withdrawing ? '처리 중...' : '탈퇴하기'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
