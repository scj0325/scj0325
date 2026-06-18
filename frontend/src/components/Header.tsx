'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Code2, Menu, Search, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../app/providers';
import { LoginModal } from './LoginModal';
import { Button } from './ui';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  const navLinks = [
    { name: '프로젝트 찾기', path: '/projects' },
    { name: '포트폴리오 찾기', path: '/developers' },
    ...(!loading && user ? [{ name: '마이페이지', path: '/mypage' }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo & Desktop Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-blue-600">
            <Code2 className="h-6 w-6" />
            <span className="font-bold text-xl tracking-tight text-slate-900">
              DevLink
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`text-sm font-medium whitespace-nowrap transition-colors hover:text-blue-600 ${
                  pathname === link.path ? 'text-blue-600' : 'text-slate-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="프로젝트 검색..."
              className="h-9 w-40 lg:w-56 rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
          {!loading && user ? (
            <>
              <Link href="/projects/new">
                <Button size="sm" variant="gradient">
                  프로젝트 만들기
                </Button>
              </Link>
              <div className="h-8 w-px bg-slate-200 mx-1" />
              <button className="text-slate-500 hover:text-slate-900 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <Link
                href="/mypage"
                className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200 overflow-hidden"
              >
                {user.profileImageUrl && !avatarError ? (
                  <img
                    src={user.profileImageUrl}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span className="text-xs font-medium">
                    {user.nickname?.[0]?.toUpperCase()}
                  </span>
                )}
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}
              className='flex-1 md:flex-none gap-2 text-red-600 hover:text-red-700 hover:bg-red-50'>
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsLoginModalOpen(true)}>
                로그인
              </Button>
              <Link href="/projects/new">
                <Button size="sm" variant="gradient">
                  프로젝트 만들기
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 text-slate-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-200 bg-white"
          >
            <div className="flex flex-col px-4 py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className="text-sm font-medium text-slate-600 hover:text-blue-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                {!loading && user ? (
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  >
                    로그아웃
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() => { setIsLoginModalOpen(true); setIsMobileMenuOpen(false); }}
                  >
                    로그인
                  </Button>
                )}
                <Link href="/projects/new" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="gradient" className="w-full justify-center">
                    프로젝트 만들기
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoginModalOpen && (
        <LoginModal onClose={() => setIsLoginModalOpen(false)} />
      )}
    </header>
  );
}
