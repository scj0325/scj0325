import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from './ui'

interface PaginationControlsProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

export function PaginationControls({
  page,
  pageCount,
  onPageChange,
}: PaginationControlsProps) {
  if (pageCount <= 1) return null

  return (
    <div className="mt-10 flex items-center justify-center gap-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        이전
      </Button>
      <span className="min-w-16 text-center text-sm text-slate-500">
        {page + 1} / {pageCount}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page + 1 >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        다음
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  )
}
