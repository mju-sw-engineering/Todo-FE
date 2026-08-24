import Image from 'next/image'
import { HiveIcon } from '@/components/ui/HiveIcon'
import type { FeedBadge } from '@/types/feed.types'

function BadgeIcon({ icon }: { icon: FeedBadge['icon'] }) {
  if (icon === 'bee') {
    return <Image src="/images/bee/happy.svg" alt="" width={36} height={32} />
  }
  if (icon === 'hive') {
    return <HiveIcon size={32} />
  }
  return (
    <svg viewBox="0 0 60 72" width="28" aria-hidden="true">
      <defs>
        <linearGradient id="badge-drop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe042" />
          <stop offset="1" stopColor="#e0a400" />
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
        fill="#fff3d2"
        opacity="0.85"
        transform="rotate(-18 22 42)"
      />
    </svg>
  )
}

function MedalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="medal-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe093" />
          <stop offset="1" stopColor="#f0b800" />
        </linearGradient>
      </defs>
      <path d="M8.5 3L6 9.5L9.5 11.5L12 6z" fill="#ffdd66" />
      <path d="M15.5 3L18 9.5L14.5 11.5L12 6z" fill="#ffe042" />
      <circle cx="12" cy="14.5" r="6.5" fill="url(#medal-face)" />
      <circle cx="12" cy="14.5" r="6.5" stroke="#e0a400" strokeWidth="1" />
      <path
        d="M12 11.2l1 2 2.2 0.3-1.6 1.5 0.4 2.2-2-1-2 1 0.4-2.2-1.6-1.5 2.2-0.3z"
        fill="#fff3d2"
      />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="2.5"
        stroke="#b3b3ba"
        strokeWidth="1.8"
        fill="none"
      />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke="#b3b3ba"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

interface Props {
  badges: FeedBadge[]
}

/** 마일스톤 배지 — 획득 전에는 잠금으로 표시 */
export function BadgesCard({ badges }: Props) {
  const acquiredCount = badges.filter((b) => b.acquired).length

  return (
    <section className="mx-5 mt-4 bg-white rounded-[24px] border border-border p-5">
      <div className="flex items-start justify-between">
        <h2 className="text-[16px] font-black text-ink tracking-[-0.2px] flex items-center gap-1.5">
          <MedalIcon />
          배지
        </h2>
        <span className="shrink-0 text-[12px] font-bold text-ink">
          {acquiredCount} / {badges.length}
        </span>
      </div>
      <p className="text-[12px] text-muted mt-0.5">꾸준함의 순간들을 모아요</p>

      <div className="flex gap-4 mt-4 overflow-x-auto scrollbar-hidden snap-x snap-mandatory -mx-5 px-5">
        {badges.map((badge) => (
          <div key={badge.id} className="flex flex-col items-center gap-2 shrink-0 w-18 snap-start">
            {badge.acquired ? (
              <span
                className="relative w-15 h-15 rounded-full flex items-center justify-center overflow-hidden shadow-[0_6px_14px_-4px_rgba(224,164,0,0.55)]"
                style={{
                  background: 'linear-gradient(160deg, #fff3d2 0%, #ffe042 55%, #f0b800 100%)',
                }}
              >
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle at 32% 26%, rgba(255,255,255,0.85), rgba(255,255,255,0) 55%)',
                  }}
                />
                <span className="relative">
                  <BadgeIcon icon={badge.icon} />
                </span>
              </span>
            ) : (
              <span className="w-15 h-15 rounded-full flex items-center justify-center bg-neutral-30/70 border border-dashed border-neutral-50">
                <LockIcon />
              </span>
            )}
            <span
              className={`text-[11px] font-bold text-center leading-tight ${badge.acquired ? 'text-ink' : 'text-[#b3b3ba]'}`}
            >
              {badge.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
