'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { useAuth } from '@/store/authStore'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, token, isInitialized, logout } = useAuth()

  useEffect(() => {
    if (isInitialized && !token) {
      router.replace('/login')
    }
  }, [isInitialized, token, router])

  if (!isInitialized || !user) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  function handleLogout() {
    logout()
    router.push('/login')
  }

  return (
    <div
      className="min-h-dvh flex flex-col bg-surface"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 20% 20%, rgba(91,79,207,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(91,79,207,0.04) 0%, transparent 60%)',
      }}
    >
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-5">
        <span className="text-[18px] font-bold text-ink tracking-tight">
          Todo<span className="text-primary">Team</span>
        </span>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 text-[13px] font-semibold text-primary bg-primary-light hover:bg-[#e0daf8] rounded-lg transition-all duration-200"
        >
          로그아웃
        </button>
      </header>

      {/* 콘텐츠 */}
      <main className="flex-1 flex flex-col pt-14 pb-16">{children}</main>

      <BottomNav />
    </div>
  )
}
