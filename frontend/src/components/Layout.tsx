import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from './ui';
import { Code2, Search, Menu, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navLinks = [
  {
    name: '프로젝트 찾기',
    path: '/projects'
  },
  {
    name: '포트폴리오 찾기',
    path: '/developers'
  },
  {
    name: '마이페이지',
    path: '/mypage'
  }];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-blue-600">
              <Code2 className="h-6 w-6" />
              <span className="font-bold text-xl tracking-tight text-slate-900">
                DevLink
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) =>
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${location.pathname === link.path ? 'text-blue-600' : 'text-slate-600'}`}>
                
                  {link.name}
                </Link>
              )}
            </nav>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="프로젝트 검색..."
                className="h-9 w-64 rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600" />
              
            </div>
            <Link to="/projects">
              <Button variant="ghost" size="sm">
                로그인
              </Button>
            </Link>
            <Link to="/projects/new">
              <Button size="sm" variant="gradient">
                프로젝트 만들기
              </Button>
            </Link>
            <div className="h-8 w-px bg-slate-200 mx-1" />
            <button className="text-slate-500 hover:text-slate-900 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <Link
              to="/mypage"
              className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200 overflow-hidden">
              
              <img
                src="https://i.pravatar.cc/150?u=current"
                alt="Avatar"
                className="h-full w-full object-cover" />
              
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            
            {isMobileMenuOpen ?
            <X className="h-6 w-6" /> :

            <Menu className="h-6 w-6" />
            }
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen &&
          <motion.div
            initial={{
              opacity: 0,
              height: 0
            }}
            animate={{
              opacity: 1,
              height: 'auto'
            }}
            exit={{
              opacity: 0,
              height: 0
            }}
            className="md:hidden border-t border-slate-200 bg-white">
            
              <div className="flex flex-col px-4 py-4 space-y-4">
                {navLinks.map((link) =>
              <Link
                key={link.name}
                to={link.path}
                className="text-sm font-medium text-slate-600 hover:text-blue-600"
                onClick={() => setIsMobileMenuOpen(false)}>
                
                    {link.name}
                  </Link>
              )}
                <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                  <Link
                  to="/projects"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  
                    <Button variant="outline" className="w-full justify-center">
                      로그인
                    </Button>
                  </Link>
                  <Link
                  to="/projects/new"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  
                    <Button
                    variant="gradient"
                    className="w-full justify-center">
                    
                      프로젝트 만들기
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          }
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link
                to="/"
                className="flex items-center gap-2 text-blue-600 mb-4">
                
                <Code2 className="h-6 w-6" />
                <span className="font-bold text-xl tracking-tight text-slate-900">
                  DevLink
                </span>
              </Link>
              <p className="text-slate-500 text-sm max-w-sm">
                개발자들이 사이드 프로젝트를 찾고, 포트폴리오를 구축하며,
                스타트업 빌더들과 연결될 수 있는 모던 플랫폼입니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">플랫폼</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <Link to="/projects" className="hover:text-blue-600">
                    프로젝트 찾기
                  </Link>
                </li>
                <li>
                  <Link to="/projects/new" className="hover:text-blue-600">
                    프로젝트 만들기
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-blue-600">
                    개발자
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">약관</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <Link to="#" className="hover:text-blue-600">
                    개인정보 처리방침
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-blue-600">
                    이용약관
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-slate-400">
            <p>© 2026 DevLink. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <span>Twitter</span>
              <span>GitHub</span>
              <span>Discord</span>
            </div>
          </div>
        </div>
      </footer>
    </div>);

}