'use client'

import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { createReport } from '../lib/api'
import type { ReportReasonType, ReportTargetType } from '../types'
import { Button, Modal } from './ui'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  targetType: ReportTargetType
  targetId: number
  targetName: string
}

const REASON_OPTIONS: { label: string; value: ReportReasonType }[] = [
  { label: '스팸/부적절한 홍보', value: 'SPAM' },
  { label: '욕설/비하 발언', value: 'ABUSE' },
  { label: '광고성 콘텐츠', value: 'ADVERTISEMENT' },
  { label: '부적절한 내용', value: 'INAPPROPRIATE_CONTENT' },
  { label: '사기/허위 정보', value: 'FRAUD' },
  { label: '기타', value: 'ETC' },
]

export function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
}: ReportModalProps) {
  const [reasonType, setReasonType] = useState<ReportReasonType>('SPAM')
  const [reasonDetail, setReasonDetail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      await createReport({
        targetType,
        targetId,
        reasonType,
        reasonDetail,
      })
      toast.success('신고가 성공적으로 접수되었습니다.')
      onClose()
      setReasonDetail('')
    } catch (error) {
      console.error('Failed to submit report:', error)
      toast.error(
        error instanceof Error ? error.message : '신고 접수에 실패했습니다.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${targetType === 'PORTFOLIO' ? '포트폴리오' : '프로젝트'} 신고`}
    >
      <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-bold text-red-900 mb-1">안내사항</p>
          <p className="text-red-700 leading-relaxed">
            <span className="font-semibold">"{targetName}"</span>에 대한 신고를 진행합니다.
            허위 신고 시 서비스 이용에 제한이 있을 수 있으니 신중하게 작성해 주세요.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            신고 사유 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {REASON_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setReasonType(option.value)}
                className={`px-4 py-2.5 text-sm rounded-lg border transition-all text-left ${
                  reasonType === option.value
                    ? 'bg-red-50 border-red-500 text-red-700 font-semibold ring-1 ring-red-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            상세 사유 (선택)
          </label>
          <textarea
            value={reasonDetail}
            onChange={(e) => setReasonDetail(e.target.value)}
            className="min-h-[120px] w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all placeholder:text-slate-400"
            placeholder="상세한 신고 사유를 적어주시면 빠른 처리에 도움이 됩니다."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="gradient"
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white border-none"
            disabled={isSubmitting}
          >
            {isSubmitting ? '접수 중...' : '신고하기'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
