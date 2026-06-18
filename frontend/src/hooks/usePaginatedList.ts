import { DependencyList, useEffect, useMemo, useState } from 'react'

interface UsePaginatedListOptions<T> {
  items: T[]
  pageSize: number
  resetDeps: DependencyList
}

export function usePaginatedList<T>({
  items,
  pageSize,
  resetDeps,
}: UsePaginatedListOptions<T>) {
  const [page, setPage] = useState(0)
  const pageCount = Math.ceil(items.length / pageSize)
  const paginatedItems = useMemo(
    () => items.slice(page * pageSize, (page + 1) * pageSize),
    [items, page, pageSize],
  )

  useEffect(() => {
    setPage(0)
  }, resetDeps)

  useEffect(() => {
    if (pageCount > 0 && page >= pageCount) {
      setPage(pageCount - 1)
    }
  }, [page, pageCount])

  return {
    page,
    pageCount,
    paginatedItems,
    setPage,
  }
}
