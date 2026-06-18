'use client'

import { Code2 } from 'lucide-react'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export default function LoginPage() {
  const handleLogin = (provider: string) => {
    window.location.href = `${API_BASE}/oauth2/authorization/${provider}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 mb-6">
            <Code2 className="h-7 w-7" />
            <span className="font-bold text-2xl tracking-tight text-slate-900">DevLink</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">로그인</h1>
          <p className="text-sm text-slate-500 mt-2">소셜 계정으로 간편하게 시작하세요</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col gap-3">
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
}
