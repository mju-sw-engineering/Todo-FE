'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { LogoBlob } from '@/components/ui/LogoBlob'
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
        <div className="w-8 h-8 border-[3px] border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-dvh max-w-97.5 mx-auto overflow-hidden flex flex-col translate-x-0 relative">
      <header className="h-14 shrink-0 bg-white/80 backdrop-blur-sm border-b border-border flex items-center px-5">
        <div className="flex items-center gap-2">
          <LogoBlob size={32} />
          <span className="text-[17px] font-black text-gray-900 tracking-tight">
            Todo<span className="font-medium text-gray-500">Team</span>
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col min-h-0">{children}</main>

      <BottomNav />
    </div>
  )
}
