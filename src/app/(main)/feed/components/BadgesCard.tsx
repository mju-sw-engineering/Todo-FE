import Image from 'next/image'
import { HiveIcon } from '@/components/ui/HiveIcon'
import type { FeedBadge } from '@/types/feed.types'

function BadgeIcon({ icon }: { icon: FeedBadge['icon'] }) {
  if (icon === 'bee') {
    return <Image src="/images/bee/happy.svg" alt="" width={32} height={28} />
  }
  if (icon === 'hive') {
    return <HiveIcon size={28} />
  }
  return (
    <svg viewBox="0 0 60 72" width="24" aria-hidden="true">
      <defs>
        <linearGradient id="badge-drop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffc94d" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <path
        d="M30 4 C38 20 52 32 52 46 a22 22 0 1 1 -44 0 C8 32 22 20 30 4z"
        fill="url(#badge-drop)"
      />
      <ellipse
        cx="22"
        cy="42"
        rx="5.5"
        ry="8.5"
        fill="#ffe29b"
        opacity="0.85"
        transform="rotate(-18 22 42)"
      />
    </svg>
  )
}

interface Props {
  badges: FeedBadge[]
}

/** 마일스톤 배지 — 획득 전에는 잠금(?)으로 표시 */
export function BadgesCard({ badges }: Props) {
  const acquiredCount = badges.filter((b) => b.acquired).length

  return (
    <section className="mx-5 mt-3.5 bg-white rounded-[24px] border border-[#f1e6cd] p-5">
      <div className="flex items-start justify-between">
        <h2 className="text-[16px] font-black text-ink tracking-[-0.2px]">배지</h2>
        <span className="shrink-0 text-[12px] font-bold text-[#b45309]">
          {acquiredCount} / {badges.length}
        </span>
      </div>
      <p className="text-[12px] text-muted mt-0.5">꾸준함의 순간들을 모아요</p>

      <div className="grid grid-cols-3 gap-x-2 gap-y-4 mt-4">
        {badges.map((badge) => (
          <div key={badge.id} className="flex flex-col items-center gap-1.5">
            {badge.acquired ? (
              <span
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(155deg, #ffedc2, #ffd97a)',
                  boxShadow: 'inset 0 0 0 1.5px #f0b429',
                }}
              >
                <BadgeIcon icon={badge.icon} />
              </span>
            ) : (
              <span
                className="w-12 h-12 rounded-full flex items-center justify-center bg-[#f0f0f2] text-[17px] font-black text-[#c0c0c6]"
                style={{ boxShadow: 'inset 0 0 0 1.5px #e2e2e6' }}
              >
                ?
              </span>
            )}
            <span
              className={`text-[11px] font-bold ${badge.acquired ? 'text-[#57430f]' : 'text-[#b3b3ba]'}`}
            >
              {badge.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
