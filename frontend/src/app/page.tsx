'use client'

import dynamic from 'next/dynamic'

// 빌드 타임(서버) 환경에서의 렌더링을 완전히 꺼서(ssr: false) 프리렌더 에러 차단!
const MainClientComponent = dynamic(() => import('./component/MainClientComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <p className="text-lg font-semibold text-slate-500">
        잠시만 기다려주세요...
      </p>
    </div>
  ),
})

export default function LandingPage() {
  return <MainClientComponent />
}
