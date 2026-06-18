'use client'

import { LayoutDashboard, History, ShieldAlert, ChevronRight, FolderX } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const menuItems = [
    {
      title: '신고 관리',
      icon: <ShieldAlert className="w-5 h-5" />,
      href: '/admin/reports',
      description: '대기 중인 신고 내역 처리'
    },
    {
      title: '관리 기록',
      icon: <History className="w-5 h-5" />,
      href: '/admin/reports/history',
      description: '처리/기각 완료된 내역'
    },
    {
      title: '프로젝트 관리',
      icon: <FolderX className="w-5 h-5" />,
      href: '/admin/projects',
      description: '숨김 처리된 프로젝트 관리'
    }
  ]

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-slate-50/50">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-200 bg-white hidden lg:block sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8 px-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-900">관리자 센터</span>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-200'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm leading-none mb-1">{item.title}</div>
                    <div className={`text-[10px] ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>
                      {item.description}
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="text-xs text-slate-500 mb-1">현재 계정</div>
            <div className="font-semibold text-slate-900 text-sm truncate">Administrator</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-hidden">
        <div className="h-full p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
