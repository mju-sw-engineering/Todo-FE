import type { Metadata } from 'next'
import { AuthProvider } from '@/store/authStore'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'TodoTeam',
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
    <html lang="ko" className="h-full">
      <body className="min-h-full">
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
