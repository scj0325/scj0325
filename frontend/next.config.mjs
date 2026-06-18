/** @type {import('next').NextConfig} */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return {
      fallback: [
        {
          source: '/auth/:path*',
          destination: `${BACKEND_URL}/auth/:path*`,
        },
        {
          source: '/mypage/:path*',
          destination: `${BACKEND_URL}/mypage/:path*`,
        },
        {
          source: '/portfolios/:path*',
          destination: `${BACKEND_URL}/portfolios/:path*`,
        },
        {
          source: '/projects/:path*',
          destination: `${BACKEND_URL}/projects/:path*`,
        },
      ],
    }
  },

  // 빌드 시 타입스크립트 에러가 있어도 무시하고 진행합니다.
  typescript: {
    ignoreBuildErrors: true,
  },

}

export default nextConfig
