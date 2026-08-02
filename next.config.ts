import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  deploymentId: process.env.DEPLOYMENT_VERSION,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.bluerack.org',
      },
      {
        protocol: 'http',
        hostname: '**.bluerack.org',
      },
      {
        protocol: 'https',
        hostname: '**.sslip.io',
      },
      {
        protocol: 'http',
        hostname: '**.sslip.io',
      },
    ],
  },

  /**
   * 개발용 API 프록시.
   *
   * 리프레시 토큰 쿠키가 `SameSite=Strict`라 브라우저가 크로스 사이트 요청에는 싣지 않는다.
   * `localhost:3000`에서 `api.todo.bluerack.org`를 직접 부르면 서로 다른 사이트이므로
   * 로그인은 되지만 토큰 갱신이 영영 실패한다. 운영은 `todo.bluerack.org`와
   * `api.todo.bluerack.org`가 같은 사이트라 문제가 없다.
   *
   * 프록시를 거치면 브라우저가 보기에 같은 오리진이 되어 쿠키도 CORS도 해결된다.
   * 프론트 개발자가 백엔드 서버를 직접 띄우지 않아도 된다.
   *
   * 사용법 — `.env`에 두 줄을 넣는다.
   *   NEXT_PUBLIC_API_URL=          (빈 값 → 같은 오리진으로 요청)
   *   API_PROXY_TARGET=https://api.todo.bluerack.org
   *
   * `API_PROXY_TARGET`이 없으면 rewrite가 등록되지 않으므로 운영 빌드는 영향받지 않는다.
   */
  async rewrites() {
    const target = process.env.API_PROXY_TARGET
    if (!target) return []

    return [
      {
        source: '/api/:path*',
        destination: `${target.replace(/\/$/, '')}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
