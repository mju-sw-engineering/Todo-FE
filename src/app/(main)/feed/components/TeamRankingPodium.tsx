import Image from 'next/image'
import type { FeedTeamRanking } from '@/types/feed.types'

type Medal = 'gold' | 'silver' | 'bronze'

// 우리 서비스 색상 토큰(secondary=갈색 / neutral)에서 그대로 참조한 금·은·동 배색
const MEDAL_GRADIENT: Record<Medal, [string, string]> = {
  gold: ['var(--color-secondary-10)', 'var(--color-secondary-50)'],
  silver: ['var(--color-neutral-20)', 'var(--color-neutral-60)'],
  bronze: ['#ece3da', '#8a7360'], // secondary보다 차분하고 회색을 섞은 브라운
}

const MEDAL_BEE: Record<Medal, string> = {
  gold: '/bees/cheer.svg',
  silver: '/bees/proud.svg',
  bronze: '/bees/proud.svg',
}

const CARD_BG: Record<Medal, string> = {
  gold: 'linear-gradient(150deg, #fffdf9, var(--color-secondary-10))',
  silver: 'linear-gradient(150deg, #fbfbfb, #f4f4f4)',
  bronze: 'linear-gradient(150deg, #fdfbf9, #ece3da)',
}

const RANK_TEXT: Record<Medal, string> = {
  gold: '#6b4423',
  silver: '#5b6472',
  bronze: '#5c4a3d',
}

function Crown({ medal }: { medal: Medal }) {
  const [from, to] = MEDAL_GRADIENT[medal]
  const gradId = `crown-${medal}`
  return (
    <svg viewBox="0 0 54 46" className="w-9 h-auto">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <path d="M8 37 L5 15 L19 27 L27 8 L35 27 L49 15 L46 37 Z" fill={`url(#${gradId})`} />
      <rect x="8" y="35" width="38" height="8" rx="4" fill={`url(#${gradId})`} />
    </svg>
  )
}

interface PodiumSlotProps {
  team: FeedTeamRanking
  medal: Medal
  isFirst: boolean
}

function PodiumSlot({ team, medal, isFirst }: PodiumSlotProps) {
  return (
    <div className={`relative text-center ${isFirst ? 'w-[34%]' : 'w-[29%]'}`}>
      <div className="absolute left-1/2 -translate-x-1/2 -top-6 flex flex-col items-center">
        <Crown medal={medal} />
        <span className="text-[11px] font-black -mt-3.5" style={{ color: RANK_TEXT[medal] }}>
          {team.rank}
        </span>
      </div>
      <div
        className="rounded-[18px] px-2.5 pt-3.5 pb-3 shadow-[0_10px_22px_-14px_rgba(60,50,20,0.4)]"
        style={{ background: CARD_BG[medal] }}
      >
        <div className="flex justify-center mb-1.5">
          <div className={isFirst ? 'w-21 h-21' : 'w-17 h-17'}>
            <Image
              src={MEDAL_BEE[medal]}
              alt={`${team.teamName} 벌`}
              width={128}
              height={128}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <p className="text-[12px] font-bold text-ink truncate">{team.teamName}</p>
        <p className="text-[13px] font-black text-secondary-50 mt-0.5">{team.streakDays}일</p>
      </div>
    </div>
  )
}

interface TeamRankingPodiumProps {
  rankings: FeedTeamRanking[]
}

export function TeamRankingPodium({ rankings }: TeamRankingPodiumProps) {
  const first = rankings.find((t) => t.rank === 1)
  const second = rankings.find((t) => t.rank === 2)
  const third = rankings.find((t) => t.rank === 3)

  if (!first) return null

  return (
    <div className="flex items-end justify-center gap-2.5 pt-8 pb-1">
      {second && <PodiumSlot team={second} medal="silver" isFirst={false} />}
      <PodiumSlot team={first} medal="gold" isFirst />
      {third && <PodiumSlot team={third} medal="bronze" isFirst={false} />}
    </div>
  )
}
