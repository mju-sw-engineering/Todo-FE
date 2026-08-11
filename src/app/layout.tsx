import type { Metadata, Viewport } from 'next'
import { Jua } from 'next/font/google'
import localFont from 'next/font/local'
import { AuthProvider } from '@/store/authStore'
import { Providers } from './providers'
import './globals.css'

const jua = Jua({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-jua',
  display: 'swap',
})

// CDN 대신 셀프호스팅 — Capacitor 오프라인·저속 환경에서도 폰트 유지
const pretendard = localFont({
  src: '../fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  weight: '45 920',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: '두비두비',
  description: '팀과 함께 완성하는 하루',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`h-full ${jua.variable} ${pretendard.variable}`}>
      <body className="h-full overflow-hidden">
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
