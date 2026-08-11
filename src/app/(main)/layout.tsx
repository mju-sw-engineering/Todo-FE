'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { LogoMark } from '@/components/ui/LogoBlob'
import { NotificationBell } from './components/NotificationPanel'
import { useAuth } from '@/store/authStore'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, token, isInitialized } = useAuth()

  useEffect(() => {
    if (isInitialized && !token) {
      router.replace('/login')
    }
  }, [isInitialized, token, router])

  if (!isInitialized || !user) {
    return (
      <div className="h-dvh max-w-97.5 mx-auto flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-gray-200 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-dvh max-w-97.5 mx-auto overflow-hidden flex flex-col translate-x-0 pt-[env(safe-area-inset-top)]">
      <header className="h-14 shrink-0 bg-white/80 backdrop-blur-sm border-b border-border flex items-center justify-between px-5">
        <div className="flex items-center gap-2">
          <LogoMark size={32} />
          <span className="text-[17px] font-jua text-gray-900 tracking-tight">
            두비<span className="text-gray-500">두비</span>
          </span>
        </div>
        <NotificationBell />
      </header>

      <main className="flex-1 flex flex-col min-h-0">{children}</main>

      <BottomNav />
    </div>
  )
}
