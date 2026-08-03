import type { FeedTeamRanking } from '@/types/feed.types'
import { ChampionBee } from './ChampionBee'
import { SilverBee } from './SilverBee'
import { BronzeBee } from './BronzeBee'

type Medal = 'gold' | 'silver' | 'bronze'

// 금은동은 브랜드 secondary(주황)와 무관하게 각 벌 캐릭터의 메달 색을 그대로 참조
const MEDAL_GRADIENT: Record<Medal, [string, string]> = {
  gold: ['#fff6d8', '#e8b93f'],
  silver: ['var(--color-neutral-20)', 'var(--color-neutral-60)'],
  bronze: ['#ece3da', '#8a7360'],
}

const ACCENT: Record<Medal, string> = {
  gold: '#d89a1c',
  silver: '#9aa0a6',
  bronze: '#9c5a22',
}

const RANK_TEXT: Record<Medal, string> = {
  gold: '#8a6d1f',
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

function PodiumSlot({ team, medal }: PodiumSlotProps) {
  return (
    <div className="relative text-center w-full">
      <div className="absolute left-1/2 -translate-x-1/2 -top-6 flex flex-col items-center">
        <Crown medal={medal} />
        <span className="text-[7px] font-black -mt-3.5" style={{ color: RANK_TEXT[medal] }}>
          {team.rank}
        </span>
      </div>
      <div
        className="rounded-[10px] bg-white overflow-hidden"
        style={{ borderTopColor: ACCENT[medal] }}
      >
        <div className="aspect-square w-full">
          {medal === 'gold' ? (
            <ChampionBee className="w-full h-full" />
          ) : medal === 'silver' ? (
            <SilverBee className="w-full h-full" />
          ) : (
            <BronzeBee className="w-full h-full" />
          )}
        </div>
        <div className="flex flex-row align-middle justify-center gap-2 items-center px-1.5 py-2">
          <p className="text-[12px] font-bold text-ink truncate">{team.teamName}</p>

          <div className="px-1.5 py-0.5 bg-primary-50 rounded-[14px] whitespace-nowrap">
            <p className="text-[7px] font-light text-white">{team.streakDays}일</p>
          </div>
        </div>
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
    <div className="grid grid-cols-[1.3fr_1.3fr_1fr] items-end gap-1.5 pt-8 pb-1">
      {second && <PodiumSlot team={second} medal="silver" isFirst={false} />}
      <PodiumSlot team={first} medal="gold" isFirst />
      {third && <PodiumSlot team={third} medal="bronze" isFirst={false} />}
    </div>
  )
}
