'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/store/authStore'
import { BlobAvatar } from '@/components/ui/BlobAvatar'

function TodoIcon({ active }: { active: boolean }) {
  const c = active ? '#111111' : '#9CA3AF'
  const sw = active ? 2.2 : 1.8
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
      {/* Rounded badge */}
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="5"
        stroke={c}
        strokeWidth={sw}
        fill={c}
        fillOpacity={active ? 0.07 : 0}
      />
      {/* Check */}
      <path
        d="M8 12.2l2.6 2.6 5.4-6"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Sparkle (active only) */}
      {active && (
        <path
          d="M18 3l.55 1.65 1.65.55-1.65.55L18 7.4l-.55-1.65-1.65-.55 1.65-.55z"
          fill={c}
          opacity="0.45"
        />
      )}
    </svg>
  )
}

function TeamIcon({ active }: { active: boolean }) {
  const c = active ? '#111111' : '#9CA3AF'
  const sw = active ? 2.2 : 1.8
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
      {/* Main figure head */}
      <circle cx="9" cy="7" r="2.8" stroke={c} strokeWidth={sw} />
      {/* Main figure body */}
      <path
        d="M3.5 19.2v-.7a5.5 5.5 0 015.5-5.5 5.5 5.5 0 015.5 5.5v.7"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      {/* Secondary figure head */}
      <circle
        cx="16.5"
        cy="7"
        r="2.2"
        stroke={c}
        strokeWidth={active ? 2 : 1.5}
        opacity={active ? 0.8 : 0.55}
      />
      {/* Secondary figure body */}
      <path
        d="M14.2 14.6a5 5 0 014.3 5v.6"
        stroke={c}
        strokeWidth={active ? 2 : 1.5}
        strokeLinecap="round"
        opacity={active ? 0.8 : 0.55}
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

  return (
    <nav className="h-16 shrink-0 bg-white border-t border-gray-200 flex">
      <button
        onClick={() => router.push('/mypage')}
        className="flex-1 flex flex-col items-center justify-center gap-1 transition-opacity duration-200 active:opacity-70"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden">
          {user?.profileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.profileImageUrl} alt="프로필" className="w-full h-full object-cover" />
          ) : (
            <BlobAvatar seed={user?.nickname ?? user?.loginId ?? ''} size={32} />
          )}
        </div>
      </button>

      <button
        onClick={() => router.push('/')}
        className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-200 relative"
      >
        {todoActive && (
          <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gray-900" />
        )}
        <TodoIcon active={todoActive} />
        <span
          className={`text-[11px] font-semibold ${todoActive ? 'text-gray-900' : 'text-gray-400'}`}
        >
          Todo
        </span>
      </button>

      <button
        onClick={() => router.push('/teams')}
        className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-200 relative"
      >
        {teamsActive && (
          <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gray-900" />
        )}
        <TeamIcon active={teamsActive} />
        <span
          className={`text-[11px] font-semibold ${teamsActive ? 'text-gray-900' : 'text-gray-400'}`}
        >
          내 팀
        </span>
      </button>
    </nav>
  )
}
