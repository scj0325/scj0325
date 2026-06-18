'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { CheckCircle2, FolderX, ShieldAlert, UserX, ExternalLink, Search, X } from 'lucide-react'
import Link from 'next/link'

import { Badge, Button, Card } from '../../../components/ui'
import { fetchProjectReports, fetchUserReports, resolveReport, rejectReport } from '../../../lib/api'
import { formatDate } from '../../../lib/date'
import type { ReportResponse } from '../../../types'

export default function AdminReportsPage() {
  const [userReports, setUserReports] = useState<ReportResponse[]>([])
  const [projectReports, setProjectReports] = useState<ReportResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'user' | 'project'>('user')
  const [searchKeyword, setSearchKeyword] = useState('')

  const loadData = async (keyword?: string) => {
    setLoading(true)
    try {
      const [uReports, pReports] = await Promise.all([
        fetchUserReports('PENDING', keyword),
        fetchProjectReports('PENDING', keyword),
      ])
      setUserReports(uReports || [])
      setProjectReports(pReports || [])
    } catch (err) {
      console.error('Failed to load reports:', err)
      toast.error('신고 내역을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadData(searchKeyword)
  }

  const clearSearch = () => {
    setSearchKeyword('')
    loadData('')
  }

  const handleResolve = async (id: number) => {
    try {
      await resolveReport(id)
      setUserReports((prev) => prev.filter((r) => r.reportId !== id))
      setProjectReports((prev) => prev.filter((r) => r.reportId !== id))
      toast.success('신고가 성공적으로 처리되었습니다.')
    } catch (err) {
      console.error('Failed to resolve report:', err)
      toast.error('신고 처리에 실패했습니다.')
    }
  }

  const handleReject = async (id: number) => {
    try {
      await rejectReport(id)
      setUserReports((prev) => prev.filter((r) => r.reportId !== id))
      setProjectReports((prev) => prev.filter((r) => r.reportId !== id))
      toast.success('신고가 기각되었습니다.')
    } catch (err) {
      console.error('Failed to reject report:', err)
      toast.error('신고 기각에 실패했습니다.')
    }
  }

  const getReasonBadgeColor = (reasonType: string) => {
    if (reasonType === 'OBSCENE')
      return 'bg-red-100 text-red-700 border-red-200'
    if (reasonType === 'DISRUPTIVE')
      return 'bg-orange-100 text-orange-700 border-orange-200'
    return 'bg-slate-100 text-slate-700 border-slate-200'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-slate-500">
        신고 내역을 불러오는 중...
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            관리자 신고 센터
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            플랫폼 내 접수된 포트폴리오 및 프로젝트 신고 내역을 관리합니다.
          </p>
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('user')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'user'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            포트폴리오 신고 ({userReports.length})
          </button>
          <button
            onClick={() => setActiveTab('project')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'project'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            프로젝트 신고 ({projectReports.length})
          </button>
        </div>

        <form
          onSubmit={handleSearch}
          className="relative flex items-center w-full max-w-xs"
        >
          <div className="absolute left-3 text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder={
              activeTab === 'user'
                ? '닉네임으로 검색'
                : '프로젝트 제목으로 검색'
            }
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
          />
          {searchKeyword && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </form>
      </div>

      <div className="space-y-4">
        {activeTab === 'user' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <UserX className="w-5 h-5 text-slate-400" />
                포트폴리오 신고 목록
              </h2>
              <Badge variant="secondary" className="bg-slate-100">
                {userReports.length}건
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userReports.length === 0 ? (
                <div className="empty-state col-span-full rounded-xl py-12 border border-slate-200 border-dashed bg-slate-50 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-slate-500 font-medium">
                    처리 대기 중인 포트폴리오 신고가 없습니다.
                  </p>
                </div>
              ) : (
                userReports.map((report) => (
                  <motion.div
                    key={report.reportId}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Card className="p-5 border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getReasonBadgeColor(report.reasonType)}`}
                        >
                          {report.reasonType}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDate(report.createdAt)}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                          <div className="text-xs text-slate-500 mb-2">
                            신고당한 포트폴리오 (유저)
                          </div>
                          <Link 
                            href={`/u/${report.targetId}`}
                            className="flex items-center gap-3 group"
                          >
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-white">
                              {report.targetMemberProfileImage ? (
                                <img src={report.targetMemberProfileImage} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                  <UserX className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-sm group-hover:text-red-600 flex items-center gap-1 transition-colors">
                                {report.targetMemberNickname || `User #${report.targetId}`}
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="text-xs text-slate-500 truncate max-w-[200px]">
                                {report.targetTitle || '포트폴리오 제목 없음'}
                              </div>
                            </div>
                          </Link>
                        </div>

                        <div>
                          <div className="text-xs text-slate-500 mb-1">
                            신고 상세사유
                          </div>
                          <p className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg p-3 leading-relaxed">
                            {report.reasonDetail}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">
                              신고자:
                            </span>
                            <span className="text-xs font-medium text-slate-700">
                              {report.reporterNickname || `User #${report.reporterId}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="gradient"
                              onClick={() => handleResolve(report.reportId)}
                              className="h-8 text-xs"
                            >
                              처리
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(report.reportId)}
                              className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                            >
                              기각
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <FolderX className="w-5 h-5 text-slate-400" />
                프로젝트 신고 목록
              </h2>
              <Badge variant="secondary" className="bg-slate-100">
                {projectReports.length}건
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectReports.length === 0 ? (
                <div className="empty-state col-span-full rounded-xl py-12 border border-slate-200 border-dashed bg-slate-50 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-slate-500 font-medium">
                    처리 대기 중인 프로젝트 신고가 없습니다.
                  </p>
                </div>
              ) : (
                projectReports.map((report) => (
                  <motion.div
                    key={report.reportId}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Card className="p-5 border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getReasonBadgeColor(report.reasonType)}`}
                        >
                          {report.reasonType}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDate(report.createdAt)}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                          <div className="text-xs text-slate-500 mb-2">
                            신고당한 프로젝트
                          </div>
                          <Link 
                            href={`/projects/${report.targetId}`}
                            className="flex items-center gap-3 group"
                          >
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center text-orange-500">
                              <FolderX className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-sm group-hover:text-orange-600 flex items-center gap-1 transition-colors">
                                {report.targetTitle || `Project #${report.targetId}`}
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="text-xs text-slate-500 truncate max-w-[200px] flex items-center gap-1">
                                리더: {report.targetMemberNickname || '알 수 없음'}
                              </div>
                            </div>
                          </Link>
                        </div>

                        <div>
                          <div className="text-xs text-slate-500 mb-1">
                            신고 상세사유
                          </div>
                          <p className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg p-3 leading-relaxed">
                            {report.reasonDetail}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">
                              신고자:
                            </span>
                            <span className="text-xs font-medium text-slate-700">
                              {report.reporterNickname || `User #${report.reporterId}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="gradient"
                              onClick={() => handleResolve(report.reportId)}
                              className="h-8 text-xs"
                            >
                              처리
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(report.reportId)}
                              className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                            >
                              기각
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
