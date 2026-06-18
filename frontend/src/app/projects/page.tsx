'use client'

import dynamic from 'next/dynamic'

// 🎯 경로를 ./component/ProjectListingClient 로 수정!
const ProjectListingClient = dynamic(
  () => import('./component/ProjectListingClient'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p className="text-lg font-semibold text-slate-500">
          프로젝트 목록을 불러오는 중입니다...
        </p>
      </div>
    ),
  },
)

export default function ProjectListingPage() {
  return <ProjectListingClient />
}
