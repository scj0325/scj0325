'use client';

import { Code2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export function Footer() {

  const handleTestLogin = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/test-login`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        alert('테스트 계정(아무개)으로 로그인이 완료되었습니다.');
        window.location.href = '/mypage';
      } else {
        alert('백엔드 더미 데이터 세팅 상태를 확인해 주세요.');
      }
    } catch (err) {
      alert('테스트 로그인 서버 통신 실패');
    }
  };

  return (
    <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-blue-600 mb-4">
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
                <Link href="/projects" className="hover:text-blue-600">
                  프로젝트 찾기
                </Link>
              </li>
              <li>
                <Link href="/developers" className="hover:text-blue-600">
                  포트폴리오
                </Link>
              </li>
              <li>
                <Link href="/projects/new" className="hover:text-blue-600">
                  프로젝트 만들기
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">약관</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <Link href="#" className="hover:text-blue-600">
                  개인정보 처리방침
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-600">
                  이용약관
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-slate-400">
          <p>© 2026 DevLink. All rights reserved.</p>

          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <button
              onClick={handleTestLogin}
              className="flex items-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-md hover:bg-amber-100 transition-colors"
              title="로컬 테스트 유저로 즉시 로그인합니다."
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              개발자 세션 로그인
            </button>
            <div className="flex gap-4">
              <span>Twitter</span>
              <span>GitHub</span>
              <span>Discord</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
