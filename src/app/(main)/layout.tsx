'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/store/authStore'

function TodoIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={`w-6 h-6 ${active ? 'text-primary' : 'text-muted'}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
      />
    </svg>
  )
}

function TeamIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={`w-6 h-6 ${active ? 'text-primary' : 'text-muted'}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4a4 4 0 11-8 0 4 4 0 018 0zm6-4a2 2 0 11-4 0 2 2 0 014 0zM3 8a2 2 0 114 0 2 2 0 01-4 0z"
      />
    </svg>
  )
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
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

  const isTeams = pathname === '/teams'

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/mypage')}
            className="px-3 py-1.5 text-[13px] font-semibold text-muted hover:text-ink rounded-[8px] hover:bg-surface transition-all duration-200"
          >
            마이페이지
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-[13px] font-semibold text-primary bg-primary-light hover:bg-[#e0daf8] rounded-[8px] transition-all duration-200"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 콘텐츠 */}
      <main className="flex-1 flex flex-col pt-14">{children}</main>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white/95 backdrop-blur-sm border-t border-border flex">
        <button
          onClick={() => router.push('/')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-200 ${!isTeams ? 'text-primary' : 'text-muted'}`}
        >
          <TodoIcon active={!isTeams} />
          <span className={`text-[11px] font-semibold ${!isTeams ? 'text-primary' : 'text-muted'}`}>
            Todo
          </span>
        </button>
        <button
          onClick={() => router.push('/teams')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-200 ${isTeams ? 'text-primary' : 'text-muted'}`}
        >
          <TeamIcon active={isTeams} />
          <span className={`text-[11px] font-semibold ${isTeams ? 'text-primary' : 'text-muted'}`}>
            내 팀
          </span>
        </button>
      </nav>
    </div>
  )
}
