'use client'

import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/store/authStore'
import { BlobAvatar } from '@/components/ui/BlobAvatar'

function TodoIcon({ active }: { active: boolean }) {
  const c = active ? '#669aff' : '#818181'
  const sw = active ? 2.2 : 1.8
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
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
      <path
        d="M8 12.2l2.6 2.6 5.4-6"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

function FeedIcon({ active }: { active: boolean }) {
  const c = active ? '#669aff' : '#818181'
  const sw = active ? 2.2 : 1.8
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3c3 3.2 5 6.4 5 9a5 5 0 0 1-10 0c0-1 .3-2 1-3.2.4 1 1 1.6 1.7 1.6C10.4 9 10 6.6 12 3Z"
        stroke={c}
        strokeWidth={sw}
        strokeLinejoin="round"
        fill={c}
        fillOpacity={active ? 0.1 : 0}
      />
    </svg>
  )
}

function TeamIcon({ active }: { active: boolean }) {
  const c = active ? '#669aff' : '#818181'
  const sw = active ? 2.2 : 1.8
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="2.8" stroke={c} strokeWidth={sw} />
      <path
        d="M3.5 19.2v-.7a5.5 5.5 0 015.5-5.5 5.5 5.5 0 015.5 5.5v.7"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <circle
        cx="16.5"
        cy="7"
        r="2.2"
        stroke={c}
        strokeWidth={active ? 2 : 1.5}
        opacity={active ? 0.8 : 0.55}
      />
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
  const feedActive = pathname.startsWith('/feed')
  const myPageActive = pathname.startsWith('/mypage')

  function navigate(path: string) {
    const isSamePage =
      (path === '/' && pathname === '/') ||
      (path === '/teams' && pathname.startsWith('/teams')) ||
      (path === '/feed' && pathname.startsWith('/feed')) ||
      (path === '/mypage' && pathname.startsWith('/mypage'))

    if (isSamePage) return
    router.push(path)
  }

  return (
    <nav className="h-16 shrink-0 bg-white border-t border-border flex">
      <button
        onClick={() => navigate('/')}
        aria-current={todoActive ? 'page' : undefined}
        className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-200 relative"
      >
        {todoActive && (
          <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
        )}
        <TodoIcon active={todoActive} />
        <span className={`text-[11px] font-semibold ${todoActive ? 'text-primary' : 'text-muted'}`}>
          투두
        </span>
      </button>

      <button
        onClick={() => navigate('/teams')}
        aria-current={teamsActive ? 'page' : undefined}
        className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-200 relative"
      >
        {teamsActive && (
          <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
        )}
        <TeamIcon active={teamsActive} />
        <span
          className={`text-[11px] font-semibold ${teamsActive ? 'text-primary' : 'text-muted'}`}
        >
          팀
        </span>
      </button>

      <button
        onClick={() => navigate('/feed')}
        aria-current={feedActive ? 'page' : undefined}
        className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-200 relative"
      >
        {feedActive && (
          <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
        )}
        <FeedIcon active={feedActive} />
        <span className={`text-[11px] font-semibold ${feedActive ? 'text-primary' : 'text-muted'}`}>
          피드
        </span>
      </button>

      <button
        onClick={() => navigate('/mypage')}
        aria-current={myPageActive ? 'page' : undefined}
        className="flex-1 flex flex-col items-center justify-center gap-1 transition-opacity duration-200 active:opacity-70 relative"
      >
        {myPageActive && (
          <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
        )}
        <div className="w-8 h-8 rounded-full overflow-hidden">
          {user?.profileImageUrl ? (
            <Image
              src={user.profileImageUrl}
              alt="프로필"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <BlobAvatar seed={user?.nickname ?? user?.loginId ?? ''} size={32} />
          )}
        </div>
        <span
          className={`text-[11px] font-semibold ${myPageActive ? 'text-primary' : 'text-muted'}`}
        >
          내 정보
        </span>
      </button>
    </nav>
  )
}
