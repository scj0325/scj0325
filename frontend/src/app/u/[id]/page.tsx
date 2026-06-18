'use client'

import { useEffect, useState } from 'react';
import { toast } from 'sonner';



import Link from 'next/link';
import { useParams } from 'next/navigation';



import { Calendar, Code2, Github, Globe, MapPin, MessageSquare, ShieldAlert } from 'lucide-react';



import { LoginModal } from '../../../components/LoginModal';
import { ReportModal } from '../../../components/ReportModal';
import { Badge, Button, Card, Modal } from '../../../components/ui';
import { formatPositionLabel } from '../../../constants/project';
import { cancelProjectProposal, checkAlreadyReported, createProjectProposal, fetchMember, fetchPendingSentProjectProposals, fetchProjects, fetchProposalProjects, fetchReviews } from '../../../lib/api';
import { formatDate } from '../../../lib/date';
import type { Project, ReviewResponse, User } from '../../../types';
import type { ProposalProject, SentProjectProposal } from '../../../types/dto/proposal';
import { useAuth } from '../../providers';























const statusMap: Record<string, string> = {
  Open: '모집중',
  Closed: '마감',
  Completed: '완료',
  Stopped: '중단',
}

const categoryMap: Record<string, string> = {
  Web: '웹',
  Mobile: '모바일',
  AI: 'AI',
  Game: '게임',
  Other: '기타',
}

type ProfileTab = 'projects' | 'peerReviews'

export default function DeveloperProfilePage() {
  const params = useParams()
  const id = params.id as string
  const { user: authUser, loading: authLoading } = useAuth()
  const isMyProfile = authUser !== null && String(authUser.memberId) === id
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [reviews, setReviews] = useState<ReviewResponse[]>([])
  const [activeTab, setActiveTab] = useState<ProfileTab>('projects')
  const [loading, setLoading] = useState(true)
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false)
  const [isCancelProposalModalOpen, setIsCancelProposalModalOpen] =
    useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [proposalProjects, setProposalProjects] = useState<ProposalProject[]>(
    [],
  )
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [proposalMessage, setProposalMessage] = useState('')
  const [pendingSentProposals, setPendingSentProposals] = useState<
    SentProjectProposal[]
  >([])
  const [proposalLoading, setProposalLoading] = useState(false)
  const [proposalSubmitting, setProposalSubmitting] = useState(false)
  const [proposalCancelLoading, setProposalCancelLoading] = useState(false)
  const [cancellingProposalId, setCancellingProposalId] = useState<
    number | null
  >(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    
    Promise.all([
      fetchMember(id),
      fetchProjects({ page: 0, size: 100 }),
      fetchReviews(id),
    ])
      .then(([member, pageData, reviewData]) => {
        setUser(member)
        setProjects(pageData?.content || [])
        setReviews(reviewData)
      })
      .catch(() => {
        setUser(null)
        setProjects([])
        setReviews([])
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id || !authUser || isMyProfile) {
      setPendingSentProposals([])
      return
    }

    fetchPendingSentProjectProposals(id)
      .then(setPendingSentProposals)
      .catch(() => setPendingSentProposals([]))
  }, [id, authUser, isMyProfile])

  const createdProjects = projects.filter((p) => p.leader.id === id)
  const participatedProjects = projects.filter((p) =>
    p.teamMembers.some((m) => m.id === id),
  )

  const handleOpenProposal = async () => {
    if (authLoading) return
    if (!authUser) {
      setIsLoginModalOpen(true)
      return
    }

    setIsProposalModalOpen(true)
    setProposalLoading(true)
    try {
      const proposalProjectData = await fetchProposalProjects()
      setProposalProjects(proposalProjectData)
      setSelectedProjectId(
        proposalProjectData.length > 0 ? String(proposalProjectData[0].id) : '',
      )
    } catch (error) {
      setProposalProjects([])
      toast.error(
        error instanceof Error
          ? error.message
          : '제안 가능한 프로젝트를 불러오지 못했습니다.',
      )
    } finally {
      setProposalLoading(false)
    }
  }

  const handleOpenReport = async () => {
    if (authLoading) return
    if (!authUser) {
      setIsLoginModalOpen(true)
      return
    }
    
    try {
      const isAlreadyReported = await checkAlreadyReported('PORTFOLIO', Number(id))
      if (isAlreadyReported) {
        toast.error('이미 신고하신 대상입니다.')
        return
      }
      setIsReportModalOpen(true)
    } catch (error) {
      console.error('Failed to check report status:', error)
      toast.error('신고 상태를 확인하는 중 오류가 발생했습니다.')
    }
  }

  const handleSubmitProposal = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedProjectId || !proposalMessage.trim() || proposalSubmitting) {
      return
    }

    setProposalSubmitting(true)
    try {
      await createProjectProposal(id, {
        projectId: Number(selectedProjectId),
        message: proposalMessage.trim(),
      })
      toast.success('프로젝트 제안을 보냈습니다.')
      const sentProposals = await fetchPendingSentProjectProposals(id)
      setPendingSentProposals(sentProposals)
      setIsProposalModalOpen(false)
      setProposalMessage('')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : '프로젝트 제안을 보내지 못했습니다.',
      )
    } finally {
      setProposalSubmitting(false)
    }
  }

  const handleOpenCancelProposal = async () => {
    if (authLoading) return
    if (!authUser) {
      setIsLoginModalOpen(true)
      return
    }

    setProposalCancelLoading(true)
    setIsCancelProposalModalOpen(true)
    try {
      const sentProposals = await fetchPendingSentProjectProposals(id)
      setPendingSentProposals(sentProposals)
    } catch (error) {
      setPendingSentProposals([])
      toast.error(
        error instanceof Error
          ? error.message
          : '보낸 제안을 불러오지 못했습니다.',
      )
    } finally {
      setProposalCancelLoading(false)
    }
  }

  const handleCancelProposal = async (proposalId: number) => {
    if (cancellingProposalId) return
    if (!confirm('프로젝트 제안을 취소하시겠습니까?')) return

    setCancellingProposalId(proposalId)
    try {
      await cancelProjectProposal(proposalId)
      setPendingSentProposals((prev) =>
        prev.filter((proposal) => proposal.proposalId !== proposalId),
      )
      toast.success('프로젝트 제안을 취소했습니다.')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : '프로젝트 제안을 취소하지 못했습니다.',
      )
    } finally {
      setCancellingProposalId(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-slate-500">
        프로필을 불러오는 중...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900">
          사용자를 찾을 수 없어요
        </h2>
        <Link
          href="/projects"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          프로젝트 목록으로
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 text-center">
            <div className="relative inline-block mb-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
              />
              <div
                className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full"
                title="프로젝트 참여 가능"
              ></div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
            <p className="text-blue-600 font-medium mb-4">
              {formatPositionLabel(user.role)}
            </p>

            <div className="mb-6 space-y-2">
              {isMyProfile ? (
                <Link href="/mypage/portfolio/edit" className="w-full">
                  <Button variant="gradient" className="w-full">
                    포트폴리오 수정
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={handleOpenProposal}
                  disabled={authLoading}
                >
                  프로젝트 제안하기
                </Button>
              )}
              {!isMyProfile && pendingSentProposals.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full border-red-200 text-red-500 hover:bg-red-50"
                  onClick={handleOpenCancelProposal}
                  disabled={authLoading}
                >
                  제안 취소하기
                </Button>
              )}
            </div>

            <div className="space-y-3 text-sm text-slate-600 text-left border-t border-slate-100 pt-6">
              {user.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.github && (
                <div className="flex items-center gap-3">
                  <Github className="w-4 h-4 text-slate-400" />
                  <a
                    href={user.github}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-blue-600 transition-colors"
                  >
                    {user.github.replace('https://github.com/', '')}
                  </a>
                </div>
              )}
              {user.portfolio && (
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <a
                    href={user.portfolio}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-blue-600 transition-colors"
                  >
                    포트폴리오 사이트
                  </a>
                </div>
              )}
              <div className="flex items-center justify-between group/report">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>2026년 6월 가입</span>
                </div>
                {!isMyProfile && (
                  <button
                    onClick={handleOpenReport}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                    title="신고하기"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-blue-600" />
              기술 스택
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.techStack?.map((tech) => (
                <Badge key={tech} variant="secondary">
                  {tech}
                </Badge>
              ))}
              {(!user.techStack || user.techStack.length === 0) && (
                <span className="text-sm text-slate-500">
                  등록된 기술 스택이 없어요.
                </span>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Activity & Projects */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">소개</h2>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-slate-600 leading-relaxed">
              {user.bio || '아직 소개글을 작성하지 않았어요.'}
            </div>
          </section>

          <section>
            <div className="mb-6 flex gap-2 border-b border-slate-200 pb-4 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('projects')}
                className={`tab-pill ${activeTab === 'projects' ? 'tab-pill-active' : 'tab-pill-inactive'}`}
              >
                프로젝트
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('peerReviews')}
                className={`tab-pill ${activeTab === 'peerReviews' ? 'tab-pill-active' : 'tab-pill-inactive'}`}
              >
                받은 피어리뷰
              </button>
            </div>

            {activeTab === 'projects' ? (
              <div className="space-y-8">
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900">
                      만든 프로젝트
                    </h2>
                    <Badge variant="default">{createdProjects.length}</Badge>
                  </div>
                  {createdProjects.length > 0 ? (
                    <div className="grid gap-4">
                      {createdProjects.map((project) => (
                        <Link key={project.id} href={`/projects/${project.id}`}>
                          <Card className="compact-listing-card group">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                                {project.title}
                              </h3>
                              <Badge
                                variant={
                                  project.recruitmentStatus === 'Open'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {statusMap[project.recruitmentStatus]}
                              </Badge>
                            </div>
                            <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                              {project.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <Code2 className="w-4 h-4" />
                                {categoryMap[project.category]}
                              </span>
                              <span>•</span>
                              <span>
                                {project.techStack.slice(0, 3).join(', ')}
                              </span>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      아직 만든 프로젝트가 없어요.
                    </div>
                  )}
                </section>

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900">
                      참여한 프로젝트
                    </h2>
                    <Badge variant="secondary">
                      {participatedProjects.length}
                    </Badge>
                  </div>
                  {participatedProjects.length > 0 ? (
                    <div className="grid gap-4">
                      {participatedProjects.map((project) => (
                        <Link key={project.id} href={`/projects/${project.id}`}>
                          <Card className="compact-listing-card group">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                                {project.title}
                              </h3>
                            </div>
                            <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                              {project.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <img
                                src={project.leader.avatar}
                                alt={project.leader.name}
                                className="w-6 h-6 rounded-full"
                              />
                              <span className="text-sm text-slate-600">
                                {project.leader.name} 리더
                              </span>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      아직 참여한 프로젝트가 없어요.
                    </div>
                  )}
                </section>
              </div>
            ) : (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">
                    받은 피어리뷰
                  </h2>
                  <Badge variant="secondary">{reviews.length}</Badge>
                </div>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.reviewId} className="p-5">
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <Badge variant="outline">{review.projectTitle}</Badge>
                          <span className="text-xs text-slate-400">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                            <h3 className="mb-2 text-xs font-bold text-blue-600">
                              좋은 점
                            </h3>
                            <p className="text-sm leading-relaxed text-slate-700">
                              {review.content.a1 || '-'}
                            </p>
                          </div>
                          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                            <h3 className="mb-2 text-xs font-bold text-amber-600">
                              아쉬운 점
                            </h3>
                            <p className="text-sm leading-relaxed text-slate-700">
                              {review.content.a2 || '-'}
                            </p>
                          </div>
                          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                            <h3 className="mb-2 text-xs font-bold text-emerald-600">
                              감사한 점
                            </h3>
                            <p className="text-sm leading-relaxed text-slate-700">
                              {review.content.a3 || '-'}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <MessageSquare className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                    아직 받은 피어리뷰가 없어요.
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      <Modal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        title={`${user.name}님에게 프로젝트 제안`}
      >
        {proposalLoading ? (
          <div className="py-10 text-center text-sm text-slate-500">
            제안 가능한 프로젝트를 불러오는 중...
          </div>
        ) : proposalProjects.length === 0 ? (
          <div className="space-y-4 py-4 text-center">
            <p className="text-sm text-slate-600">
              제안할 수 있는 모집 중 프로젝트가 없습니다.
            </p>
            <p className="text-xs text-slate-500">
              리더 또는 매니저로 참여 중인 모집 프로젝트가 필요합니다.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsProposalModalOpen(false)}
            >
              확인
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmitProposal} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                제안할 프로젝트 <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
                className="form-select"
                required
              >
                {proposalProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                제안 메시지 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={proposalMessage}
                onChange={(event) => setProposalMessage(event.target.value)}
                className="form-textarea min-h-32"
                placeholder="프로젝트 소개와 함께 합류를 제안하는 이유를 작성해주세요."
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsProposalModalOpen(false)}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="gradient"
                disabled={proposalSubmitting || !proposalMessage.trim()}
              >
                {proposalSubmitting ? '제안 보내는 중...' : '제안 보내기'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={isCancelProposalModalOpen}
        onClose={() => setIsCancelProposalModalOpen(false)}
        title={`${user.name}님에게 보낸 제안 취소`}
      >
        {proposalCancelLoading ? (
          <div className="py-10 text-center text-sm text-slate-500">
            보낸 제안을 불러오는 중...
          </div>
        ) : pendingSentProposals.length === 0 ? (
          <div className="space-y-4 py-4 text-center">
            <p className="text-sm text-slate-600">
              취소할 수 있는 대기 중 제안이 없습니다.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCancelProposalModalOpen(false)}
            >
              확인
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingSentProposals.map((proposal) => (
              <div
                key={proposal.proposalId}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {proposal.projectTitle}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    대기 중인 프로젝트 제안
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-red-200 text-red-500 hover:bg-red-50"
                  disabled={cancellingProposalId === proposal.proposalId}
                  onClick={() => handleCancelProposal(proposal.proposalId)}
                >
                  {cancellingProposalId === proposal.proposalId
                    ? '취소 중...'
                    : '취소'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {isLoginModalOpen && (
        <LoginModal onClose={() => setIsLoginModalOpen(false)} />
      )}

      {user && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          targetType="PORTFOLIO"
          targetId={Number(id)}
          targetName={user.name}
        />
      )}
    </div>
  )
}
