import type { TeamRhythm } from '@/types/feed.types'

export interface RankedTeam {
  team: TeamRhythm
  rank: number
  tied: boolean
}

/**
 * 표준 경쟁 순위(1,2,2,4 ...)로 정렬한다. 새 랭킹 점수는 만들지 않고 이미 있는
 * streakDays만 본다. 동점이면 같은 순위를 매기고 tied로 표시한다.
 */
export function withRanks(teams: TeamRhythm[]): RankedTeam[] {
  const sorted = [...teams].sort((a, b) => b.streakDays - a.streakDays)
  let rank = 0
  let prevStreak: number | null = null
  const ranked = sorted.map((team, i) => {
    if (prevStreak === null || team.streakDays !== prevStreak) rank = i + 1
    prevStreak = team.streakDays
    return { team, rank }
  })
  const rankCounts = new Map<number, number>()
  ranked.forEach((r) => rankCounts.set(r.rank, (rankCounts.get(r.rank) ?? 0) + 1))
  return ranked.map((r) => ({ ...r, tied: (rankCounts.get(r.rank) ?? 0) > 1 }))
}
