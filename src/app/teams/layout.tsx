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
      <div className="h-dvh max-w-97.5 mx-auto flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-dvh max-w-97.5 mx-auto overflow-hidden flex flex-col translate-x-0">
      <div className="flex-1 flex flex-col min-h-0">{children}</div>
      <BottomNav />
    </div>
  )
}
