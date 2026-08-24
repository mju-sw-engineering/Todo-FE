import { HiveIcon } from '@/components/ui/HiveIcon'
import type { FeedBadge } from '@/types/feed.types'

/**
 * 배지 칸(60px 금색 메달) 전용 벌 아이콘. 같은 캐릭터지만 팔다리·기울기를 뺀
 * 정면 아이콘이라 30px대에서도 벌로 읽힌다. 일러스트가 필요한 자리는 BeePose를 쓴다.
 */
function BeeIcon() {
  return (
    <svg viewBox="0 0 48 48" width="34" aria-hidden="true">
      <g fill="none" stroke="#000000" strokeWidth="2.6" strokeLinecap="round">
        <path d="M19.5 9.5C18 6.5 16 5 14 4.5" />
        <path d="M28.5 9.5C30 6.5 32 5 34 4.5" />
      </g>
      <circle cx="13.4" cy="4.2" r="2.5" />
      <circle cx="34.6" cy="4.2" r="2.5" />
      <g fill="#EAF6FB" stroke="#CDEAF6" strokeWidth="1.2">
        <ellipse cx="12" cy="27" rx="9.5" ry="6" transform="rotate(-22 12 27)" />
        <ellipse cx="36" cy="27" rx="9.5" ry="6" transform="rotate(22 36 27)" />
      </g>
      <ellipse cx="24" cy="33.5" rx="11.5" ry="9.5" fill="#FFE042" />
      <rect x="14.8" y="28" width="18.4" height="4.4" rx="2.2" />
      <rect x="15.8" y="35.6" width="16.4" height="4.4" rx="2.2" />
      <circle cx="24" cy="19" r="11.5" fill="#FFE042" />
      <ellipse cx="19.5" cy="18.5" rx="2.3" ry="3" />
      <ellipse cx="28.5" cy="18.5" rx="2.3" ry="3" />
      <ellipse cx="24" cy="22.2" rx="1.9" ry="1.4" fill="#E38B2F" />
      <path
        d="M20.6 25.4Q24 28.4 27.4 25.4"
        fill="none"
        stroke="#000000"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  )
}

function BadgeIcon({ icon }: { icon: FeedBadge['icon'] }) {
  if (icon === 'bee') {
    return <BeeIcon />
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
