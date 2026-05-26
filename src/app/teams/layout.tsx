'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { useAuth } from '@/store/authStore'

export default function TeamsDetailLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { token, isInitialized } = useAuth()

  useEffect(() => {
    if (isInitialized && !token) {
      router.replace('/login')
    }
  }, [isInitialized, token, router])

  if (!isInitialized || !token) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div
      className="h-dvh flex flex-col overflow-hidden bg-surface md:items-center md:justify-start md:py-16"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 20% 20%, rgba(91,79,207,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(91,79,207,0.05) 0%, transparent 60%)',
      }}
    >
      <div className="flex-1 flex flex-col min-h-0 pb-16 md:flex-none md:w-90">{children}</div>
      <BottomNav />
    </div>
  )
}
