'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { useAuth } from '@/store/authStore'

export default function TeamsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { token, isInitialized } = useAuth()

  useEffect(() => {
    if (isInitialized && !token) {
      router.replace('/login')
    }
  }, [isInitialized, token, router])

  if (!isInitialized || !token) {
    return (
      <div className="h-dvh max-w-97.5 mx-auto flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div
      className="h-dvh max-w-97.5 mx-auto overflow-hidden flex flex-col translate-x-0 bg-surface"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 20% 20%, rgba(91,79,207,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(91,79,207,0.05) 0%, transparent 60%)',
      }}
    >
      <div className="flex-1 flex flex-col min-h-0">{children}</div>
      <BottomNav />
    </div>
  )
}
