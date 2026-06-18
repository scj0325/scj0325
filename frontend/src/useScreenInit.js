import { useMemo } from 'react'

export function useScreenInit() {
  return useMemo(() => {
    if (typeof window === 'undefined') return {}
    const screenId = new URLSearchParams(window.location.search).get(
      'mp_screen',
    )
    if (!screenId) return {}
    // manifest가 제거되었으므로 빈 객체 반환
    return {}
  }, [])
}
