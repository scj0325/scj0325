'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, MessageSquare } from 'lucide-react'

import { Badge, Button, Card } from '../../../components/ui'
import { fetchReviews } from '../../../lib/api'
import { fetchMe } from '../../../lib/auth'
import { formatDate } from '../../../lib/date'
import type { ReviewResponse } from '../../../types'

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<ReviewResponse[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      try {
        const me = await fetchMe()
        if (!me) {
          toast.error('로그인이 필요합니다.')
          router.push('/login')
          return
        }

        const data = await fetchReviews(me.memberId.toString())
        setReviews(data)
      } catch (err) {
        console.error('Error fetching reviews:', err)
        toast.error('리뷰를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-slate-500">
        리뷰를 불러오는 중...
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            className="-ml-4 text-slate-500 mb-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            마이페이지로 돌아가기
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">
            내게 달린 피어리뷰
          </h1>
          <p className="text-slate-500 mt-2">
            동료들이 남겨준 소중한 피드백입니다.
          </p>
        </div>
        <div className="hidden md:block">
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="font-semibold text-sm">
              총 {reviews.length}개의 리뷰
            </span>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <Card className="p-20 text-center border-dashed">
          <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            아직 받은 리뷰가 없어요
          </h2>
          <p className="text-slate-500 mb-8">
            프로젝트를 완료하고 팀원들과 피드백을 주고받아 보세요!
          </p>
          <Link href="/projects">
            <Button variant="gradient">프로젝트 참여하기</Button>
          </Link>
        </Card>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {reviews.map((review) => (
            <motion.div key={review.reviewId} variants={itemVariants}>
              <Card className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="bg-slate-50 text-slate-600 border-slate-200"
                      >
                        {review.projectTitle}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Q1: Praise */}
                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50">
                      <h4 className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wider">
                        1. 좋은 점
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {review.content.a1 || '-'}
                      </p>
                    </div>

                    {/* Q2: Improvement */}
                    <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100/50">
                      <h4 className="text-xs font-bold text-amber-600 mb-2 uppercase tracking-wider">
                        2. 아쉬운 점
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {review.content.a2 || '-'}
                      </p>
                    </div>

                    {/* Q3: Gratitude */}
                    <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100/50">
                      <h4 className="text-xs font-bold text-emerald-600 mb-2 uppercase tracking-wider">
                        3. 감사한 점
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {review.content.a3 || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
