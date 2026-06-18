'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Code2 } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

interface LoginModalProps {
  onClose: () => void
}

export function LoginModal({ onClose }: LoginModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = (provider: string) => {
    window.location.href = `${API_BASE}/oauth2/authorization/${provider}`
  }

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Code2 className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl text-slate-900">DevLink</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">로그인</h2>
          <p className="text-sm text-slate-500 mt-2">소셜 계정으로 간편하게 시작하세요</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleLogin('google')}
            className="flex items-center justify-center gap-3 w-full h-11 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
          >
            <img src="/icons/google.svg" alt="Google" className="h-5 w-5" />
            Google로 로그인
          </button>

          <button
            onClick={() => handleLogin('kakao')}
            className="flex items-center justify-center gap-3 w-full h-11 rounded-lg bg-[#FEE500] hover:bg-[#F0D800] transition-colors text-sm font-medium text-slate-900"
          >
            <img src="/icons/kakao.svg" alt="Kakao" className="h-5 w-5" />
            카카오로 로그인
          </button>

          <button
            onClick={() => handleLogin('github')}
            className="flex items-center justify-center gap-3 w-full h-11 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors text-sm font-medium text-white"
          >
            <img src="/icons/github.svg" alt="GitHub" className="h-5 w-5" />
            GitHub로 로그인
          </button>
        </div>
      </div>
    </div>
  )

  if (!mounted) return null
  return createPortal(modal, document.body)
}
