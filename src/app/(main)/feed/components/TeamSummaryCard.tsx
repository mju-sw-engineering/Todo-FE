import { HiveIcon } from '@/components/ui/HiveIcon'
import type { MonthlyHive, TeamRhythm } from '@/types/feed.types'

interface Props {
  hive: MonthlyHive
  team: TeamRhythm | undefined
}

/** 우리 팀 기록 — 벌집 진행 · 연속 기록 · 오늘 참여를 한 카드로 요약한다 */
export function TeamSummaryCard({ hive, team }: Props) {
  const filled = hive.dayLevels.filter((lv) => lv !== null && lv > 0).length
  const total = hive.dayLevels.length

  let todayCount = 0
  const memberCount = team?.memberCount ?? 0
  if (team && team.weeks.length > 0) {
    const week = team.weeks[team.weeks.length - 1]
    const firstFuture = week.counts.findIndex((c) => c === null)
    const todayIndex = firstFuture === -1 ? week.counts.length - 1 : firstFuture - 1
    todayCount = todayIndex >= 0 ? (week.counts[todayIndex] ?? 0) : 0
  }

  return (
    <section className="mx-5 mt-4 bg-white rounded-[22px] border border-border p-5">
      <h2 className="text-[14px] font-black text-ink flex items-center gap-1.5">
        <HiveIcon size={16} />
        {team ? `${team.teamName}의 꾸준함` : '우리 팀의 꾸준함'}
      </h2>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div>
          <p className="text-[11px] text-muted font-semibold">이번 달 벌집</p>
          <p className="text-[20px] font-black text-ink mt-0.5">
            {filled}
            <span className="text-[13px] text-muted font-bold"> / {total}칸</span>
          </p>
        </div>
        <div>
          <p className="text-[11px] text-muted font-semibold">현재 연속</p>
          <p className="text-[20px] font-black text-ink mt-0.5">
            {hive.currentStreak}
            <span className="text-[13px] text-muted font-bold">일</span>
          </p>
        </div>
      </div>

      {team && (
        <div className="mt-4 pt-3.5 border-t border-neutral-30 flex items-center justify-between">
          <span className="text-[12px] font-bold text-ink">오늘 함께한 팀원</span>
          <span className="text-[13px] font-black text-ink">
            {todayCount} / {memberCount}명
          </span>
        </div>
      )}
    </section>
  )
}
