import { TeamAvatar } from '@/components/ui/TeamAvatar'
import type { FeedTeamRanking } from '@/types/feed.types'

interface TeamRankingScrollProps {
  rankings: FeedTeamRanking[]
}

export function TeamRankingScroll({ rankings }: TeamRankingScrollProps) {
  return (
    <div
      className="flex gap-2.5 overflow-x-auto overflow-y-hidden px-5 pb-1"
      style={{ scrollbarWidth: 'none' } as React.CSSProperties}
    >
      {rankings.map((team) => {
        const isGold = team.rank === 1
        return (
          <div
            key={team.teamId}
            className={`shrink-0 w-28 rounded-2xl border px-3 py-2.5 ${
              isGold ? 'border-yellow-300 bg-yellow-50' : 'border-border bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                className={`text-[11px] font-black ${isGold ? 'text-yellow-600' : 'text-muted'}`}
              >
                #{team.rank}
              </span>
              {isGold && <span className="text-[12px] leading-none">👑</span>}
            </div>
            <TeamAvatar imageUrl={team.teamImageUrl} name={team.teamName} size="sm" />
            <p className="text-[12px] font-bold text-ink mt-1.5 truncate">{team.teamName}</p>
            <p className="text-[13px] font-black text-ink leading-none mt-0.5">
              {team.streakDays}
              <span className="text-[10px] font-semibold text-muted ml-0.5">일 연속</span>
            </p>
          </div>
        )
      })}
    </div>
  )
}
