import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import '../index.css'
import { Providers } from './providers'

export const metadata = {
  title: 'DevLink - 당신의 다음 사이드 프로젝트 팀을 찾아보세요',
  description:
    '개발자들이 사이드 프로젝트를 찾고, 포트폴리오를 구축하며, 스타트업 빌더들과 연결될 수 있는 모던 플랫폼입니다.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col bg-slate-50/50">
        <Providers>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
