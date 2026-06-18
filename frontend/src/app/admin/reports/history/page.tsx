'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import Link from 'next/link'

import {
  CheckCircle2,
  ExternalLink,
  FolderX,
  History as HistoryIcon,
  Search,
  UserX,
  X,
} from 'lucide-react'

import { Badge, Card } from '../../../../components/ui'
import { fetchProjectReports, fetchUserReports } from '../../../../lib/api'
import { formatDate } from '../../../../lib/date'
import type { ReportResponse } from '../../../../types'

export default function AdminReportsHistoryPage() {
  const [userReports, setUserReports] = useState<ReportResponse[]>([])
  const [projectReports, setProjectReports] = useState<ReportResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [statusTab, setStatusTab] = useState<'resolved' | 'rejected'>('resolved')
  const [targetTab, setTargetTab] = useState<'user' | 'project'>('user')
  const [searchKeyword, setSearchKeyword] = useState('')

  const loadData = async (keyword?: string) => {
    setLoading(true)
    try {
      const [uResolved, pResolved, uRejected, pRejected] = await Promise.all([
        fetchUserReports('RESOLVED', keyword),
        fetchProjectReports('RESOLVED', keyword),
        fetchUserReports('REJECTED', keyword),
        fetchProjectReports('REJECTED', keyword),
      ])

      // Store all history data
      setUserReports([...(uResolved || []), ...(uRejected || [])])
      setProjectReports([...(pResolved || []), ...(pRejected || [])])
    } catch (err) {
      console.error('Failed to load history:', err)
      toast.error('관리 기록을 불러오는데 실패했습니다.')
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

  const getReasonBadgeColor = (reasonType: string) => {
    if (reasonType === 'OBSCENE')
      return 'bg-red-100 text-red-700 border-red-200'
    if (reasonType === 'DISRUPTIVE')
      return 'bg-orange-100 text-orange-700 border-orange-200'
    return 'bg-slate-100 text-slate-700 border-slate-200'
  }

  // Filter logic based on dual tabs
  const currentTargetReports = targetTab === 'user' ? userReports : projectReports
  const reportsToShow = currentTargetReports
    .filter((r) => r.status === (statusTab === 'resolved' ? 'RESOLVED' : 'REJECTED'))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Count helper for tabs
  const getCount = (target: 'user' | 'project', status: 'RESOLVED' | 'REJECTED') => {
    const list = target === 'user' ? userReports : projectReports
    return list.filter(r => r.status === status).length
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-slate-500">
        관리 기록을 불러오는 중...
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
          <HistoryIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            관리 기록 히스토리
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            이미 처리되거나 기각된 신고 내역을 확인할 수 있습니다.
          </p>
        </div>
      </div>

      {/* Target Type Tabs (Portfolio / Project) */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
          <button
            onClick={() => setTargetTab('user')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              targetTab === 'user'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            포트폴리오 신고
          </button>
          <button
            onClick={() => setTargetTab('project')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              targetTab === 'project'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            프로젝트 신고
          </button>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="relative flex items-center w-full max-w-xs"
        >
          <div className="absolute left-3 text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder={targetTab === 'user' ? '닉네임으로 검색' : '프로젝트 제목으로 검색'}
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

      {/* Status Tabs (Resolved / Rejected) */}
      <div className="flex space-x-2 mb-8 border-b border-slate-200 pb-px">
        <button
          onClick={() => setStatusTab('resolved')}
          className={`px-6 py-3 text-sm font-semibold transition-all relative ${
            statusTab === 'resolved'
              ? 'text-emerald-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          처리 완료 ({getCount(targetTab, 'RESOLVED')})
          {statusTab === 'resolved' && (
            <motion.div
              layoutId="activeStatus"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
            />
          )}
        </button>
        <button
          onClick={() => setStatusTab('rejected')}
          className={`px-6 py-3 text-sm font-semibold transition-all relative ${
            statusTab === 'rejected'
              ? 'text-red-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          기각 내역 ({getCount(targetTab, 'REJECTED')})
          {statusTab === 'rejected' && (
            <motion.div
              layoutId="activeStatus"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"
            />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportsToShow.length === 0 ? (
          <div className="empty-state col-span-full text-center py-20 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
            <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">해당 내역이 없습니다.</p>
          </div>
        ) : (
          reportsToShow.map((report) => (
            <motion.div
              key={report.reportId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow h-full flex flex-col">
                <div
                  className={`h-1 w-full ${statusTab === 'resolved' ? 'bg-emerald-500' : 'bg-red-500'}`}
                />
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold uppercase tracking-wider ${getReasonBadgeColor(report.reasonType)}`}
                    >
                      {report.reasonType}
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {formatDate(report.createdAt)}
                    </span>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-tight">
                        신고 대상
                      </div>
                      <Link
                        href={
                          report.targetType === 'PORTFOLIO'
                            ? `/u/${report.targetId}`
                            : `/projects/${report.targetId}`
                        }
                        className="flex items-center gap-2 group"
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-white flex-shrink-0 flex items-center justify-center">
                          {report.targetType === 'PORTFOLIO' ? (
                            report.targetMemberProfileImage ? (
                              <img
                                src={report.targetMemberProfileImage}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserX className="w-4 h-4 text-slate-400" />
                            )
                          ) : (
                            <FolderX className="w-4 h-4 text-orange-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 text-xs truncate group-hover:text-blue-600 transition-colors flex items-center gap-1">
                            {report.targetTitle ||
                              (report.targetType === 'PORTFOLIO'
                                ? report.targetMemberNickname
                                : `Project #${report.targetId}`)}
                            <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {report.targetType === 'PORTFOLIO'
                              ? '포트폴리오'
                              : '프로젝트'}
                          </div>
                        </div>
                      </Link>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-tight">
                        상세 사유
                      </div>
                      <p className="text-xs text-slate-600 bg-slate-50/50 border border-slate-100 rounded-lg p-3 leading-relaxed italic line-clamp-3">
                        "{report.reasonDetail}"
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {report.reporterNickname?.[0] || 'U'}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        신고자:{' '}
                        <span className="font-semibold text-slate-700">
                          {report.reporterNickname}
                        </span>
                      </span>
                    </div>
                    <Badge
                      className={
                        statusTab === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-red-50 text-red-700 border-red-100'
                      }
                    >
                      {statusTab === 'resolved' ? '처리완료' : '기각됨'}
                    </Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
