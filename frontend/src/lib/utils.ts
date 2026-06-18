import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 현재 로그인한 사용자 ID 관리git
export function setCurrentUserId(userId: number | string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentUserId', String(userId))
  }
}

export function getCurrentUserId(): number | null {
  if (typeof window !== 'undefined') {
    const userId = localStorage.getItem('currentUserId')
    return userId ? parseInt(userId, 10) : null
  }
  return null
}

export function clearCurrentUserId() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUserId')
  }
}