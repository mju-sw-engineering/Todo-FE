import type { Metadata } from 'next'
import { AuthProvider } from '@/store/authStore'
import './globals.css'

export const metadata: Metadata = {
  title: 'TodoTeam',
  description: '팀과 함께 완성하는 하루',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-surface md:bg-[#ddd9ef]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
