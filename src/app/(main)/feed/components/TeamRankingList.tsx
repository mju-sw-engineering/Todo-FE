import type { FeedTeamRanking } from '@/types/feed.types'

interface TeamRankingListProps {
  rankings: FeedTeamRanking[]
}

export function TeamRankingList({ rankings }: TeamRankingListProps) {
  const detail = rankings.filter((team) => team.rank > 3)
  if (detail.length === 0) return null

  return (
    <div className="flex flex-col">
      {detail.map((team) => (
        <div
          key={team.teamId}
          className="flex items-center gap-3 py-2.5 border-b border-border last:border-none"
        >
          <span className="w-6 text-center text-[15px] font-black text-ink shrink-0">
            {team.rank}
          </span>
          <p className="flex-1 min-w-0 text-[14px] font-semibold text-ink truncate">
            {team.teamName}
          </p>
          <span className="text-[14px] font-black text-secondary-50 shrink-0">
            {team.streakDays}일
          </span>
        </div>
      ))}
    </div>
  )
}
