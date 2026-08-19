'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { useAuth } from '@/store/authStore'

export default function TeamsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { token, isInitialized } = useAuth()

  useEffect(() => {
    if (!isInitialized || token) return
    // 초대 링크처럼 목적지를 잃으면 안 되는 경로는 로그인 후 돌아올 수 있게 넘긴다.
    // useSearchParams 대신 location을 직접 읽어서 이 레이아웃이 정적 렌더링 대상에서
    // 빠지지 않게 한다(Suspense 경계 없이 쓰면 빌드가 실패한다).
    const next = encodeURIComponent(`${pathname}${window.location.search}`)
    router.replace(`/login?next=${next}`)
  }, [isInitialized, token, router, pathname])

  if (!isInitialized || !token) {
    return (
      <div className="h-dvh max-w-97.5 mx-auto flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-dvh max-w-97.5 mx-auto overflow-hidden flex flex-col translate-x-0 pt-[env(safe-area-inset-top)]">
      <div className="flex-1 flex flex-col min-h-0">{children}</div>
      <BottomNav />
    </div>
  )
}
