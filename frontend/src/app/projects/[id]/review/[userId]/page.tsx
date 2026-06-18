'use client'

import { motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Send } from 'lucide-react'

import { Button, Card } from '../../../../../components/ui'
import { createReview, fetchMember, fetchProject } from '../../../../../lib/api'
import type { Project, User } from '../../../../../types'

export default function ReviewWritePage() {
  const params = useParams()
  const projectId = params?.id as string
  const userId = params?.userId as string
  const router = useRouter()

  const [project, setProject] = useState<Project | null>(null)
  const [targetUser, setTargetUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const [praise, setPraise] = useState('')
  const [improvement, setImprovement] = useState('')
  const [gratitude, setGratitude] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!projectId || !userId) return

    setLoading(true)
    Promise.all([fetchProject(projectId), fetchMember(userId)])
      .then(([projectData, userData]) => {
        setProject(projectData)
        setTargetUser(userData)
      })
      .catch((err) => {
        console.error('Error fetching data:', err)
        toast.error('데이터를 불러오는 중 오류가 발생했습니다.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [projectId, userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!praise.trim() && !improvement.trim() && !gratitude.trim()) {
      toast.error('리뷰 내용을 입력해주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      await createReview({
        projectId: Number(projectId),
        revieweeId: Number(userId),
        content: {
          a1: praise,
          a2: improvement,
          a3: gratitude,
        },
      })

      toast.success('리뷰가 등록되었어요. 감사합니다!')
      router.push('/mypage')
    } catch (err: any) {
      console.error('Error submitting review:', err)
      toast.error(err.message || '리뷰 등록 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
        데이터를 불러오는 중...
      </div>
    )
  }

  if (!targetUser) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          리뷰 대상을 찾을 수 없어요
        </h2>
        <Button onClick={() => router.back()}>돌아가기</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <Button
        variant="ghost"
        className="mb-6 -ml-4 text-slate-500"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        돌아가기
      </Button>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            동료 리뷰 작성
          </h1>
          <p className="text-slate-500">
            {project?.title ? (
              <span className="font-semibold text-slate-700">
                [{project.title}]
              </span>
            ) : (
              ''
            )}{' '}
            프로젝트에서 함께한 동료에 대한 솔직한 피드백을 남겨주세요.
          </p>
        </div>

        <Card className="p-6 bg-slate-50/50 border-slate-200">
          <div className="flex items-center gap-4">
            <img
              src={targetUser.avatar}
              alt={targetUser.name}
              className="w-16 h-16 rounded-full border-2 border-white shadow-sm object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {targetUser.name}
              </h3>
              <p className="text-slate-500 text-sm">{targetUser.role}</p>
            </div>
          </div>
        </Card>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Question 1: Praise */}
          <motion.div
            variants={itemVariants}
            className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
          >
            <div className="bg-blue-50 border-b border-blue-100 px-5 py-3.5">
              <label
                htmlFor="q1-praise"
                className="font-semibold text-slate-900 text-base"
              >
                1. 좋은 점 / 칭찬할 점이 있나요?
              </label>
            </div>
            <div className="p-0">
              <textarea
                id="q1-praise"
                value={praise}
                onChange={(e) => setPraise(e.target.value)}
                placeholder="동료의 장점이나 배울 점, 칭찬하고 싶은 구체적인 사례를 적어주세요."
                className="w-full min-h-[120px] p-5 resize-y outline-none text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 bg-transparent"
              />
            </div>
          </motion.div>

          {/* Question 2: Improvement */}
          <motion.div
            variants={itemVariants}
            className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
          >
            <div className="bg-blue-50 border-b border-blue-100 px-5 py-3.5">
              <label
                htmlFor="q2-improvement"
                className="font-semibold text-slate-900 text-base"
              >
                2. 아쉬웠던 점 / 제안·개선 의견이 있나요?
              </label>
            </div>
            <div className="p-0">
              <textarea
                id="q2-improvement"
                value={improvement}
                onChange={(e) => setImprovement(e.target.value)}
                placeholder="더 나은 협업을 위해 개선하면 좋을 점이나 아쉬웠던 부분을 솔직하게 남겨주세요."
                className="w-full min-h-[120px] p-5 resize-y outline-none text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 bg-transparent"
              />
            </div>
          </motion.div>

          {/* Question 3: Gratitude */}
          <motion.div
            variants={itemVariants}
            className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
          >
            <div className="bg-blue-50 border-b border-blue-100 px-5 py-3.5">
              <label
                htmlFor="q3-gratitude"
                className="font-semibold text-slate-900 text-base"
              >
                3. 고맙거나 감사한 점이 있나요?
              </label>
            </div>
            <div className="p-0">
              <textarea
                id="q3-gratitude"
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                placeholder="프로젝트를 진행하며 특별히 감사했던 순간이나 마음을 전해주세요."
                className="w-full min-h-[120px] p-5 resize-y outline-none text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 bg-transparent rounded-b-xl"
              />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="pt-6 mt-8 flex justify-end gap-4 border-t border-slate-200"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="gradient"
              disabled={isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  리뷰 제출하기
                </>
              )}
            </Button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  )
}
