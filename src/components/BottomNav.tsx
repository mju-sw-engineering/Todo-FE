'use client'

import { usePathname, useRouter } from 'next/navigation'
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

export function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()

  const todoActive = pathname === '/'
  const teamsActive = pathname.startsWith('/teams')

  const initials = user?.nickname?.trim().slice(0, 2) ?? '?'

  return (
    <nav className="h-16 shrink-0 bg-white/95 backdrop-blur-sm border-t border-border flex">
      <button
        onClick={() => router.push('/mypage')}
        className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-200"
      >
        <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center">
          <span className="text-white text-[11px] font-bold leading-none">{initials}</span>
        </div>
      </button>

      <button
        onClick={() => router.push('/')}
        className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-200 ${todoActive ? 'text-primary' : 'text-muted'}`}
      >
        <TodoIcon active={todoActive} />
        <span className={`text-[11px] font-semibold ${todoActive ? 'text-primary' : 'text-muted'}`}>
          Todo
        </span>
      </button>

      <button
        onClick={() => router.push('/teams')}
        className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-200 ${teamsActive ? 'text-primary' : 'text-muted'}`}
      >
        <TeamIcon active={teamsActive} />
        <span
          className={`text-[11px] font-semibold ${teamsActive ? 'text-primary' : 'text-muted'}`}
        >
          내 팀
        </span>
      </button>
    </nav>
  )
}
