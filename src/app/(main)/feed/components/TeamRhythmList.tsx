'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { IoFlame } from 'react-icons/io5'
import { TeamAvatar } from '@/components/ui/TeamAvatar'
import type { TeamRhythm } from '@/types/feed.types'
import { withRanks } from './rank'

const DAYS = ['월', '화', '수', '목', '금', '토', '일']
/** 벌집 채우기와 공유하는 꿀 팔레트 4단계 (참여 없음 → 많음) */
const HONEY = ['#faf0d2', '#ffe9a0', '#ffdd66', '#ffe042']
/** 1~3위 배지 배경(금/은/동), 4위 이하는 그냥 회색 숫자 */
const RANK_BG = [HONEY[3], '#d3d3d3', '#e0a45a']
const RANK_TEXT = ['#5a3d00', '#333333', '#ffffff']

function formatWeekLabel(startDate: string, isCurrent: boolean) {
  const start = new Date(startDate)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const f = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`
  const sameMonth = start.getMonth() === end.getMonth()
  const range = sameMonth ? `${f(start)} – ${end.getDate()}일` : `${f(start)} – ${f(end)}`
  return isCurrent ? `이번 주 · ${range}` : range
}

interface RowProps {
  rank: number
  tied: boolean
  team: TeamRhythm
  expanded: boolean
  onToggle: () => void
}

function TeamRow({ rank, tied, team, expanded, onToggle }: RowProps) {
  const [weekIndex, setWeekIndex] = useState(team.weeks.length - 1)
  const [risen, setRisen] = useState(false)

  useEffect(() => {
    if (!expanded) return
    const raf = requestAnimationFrame(() => setRisen(true))
    return () => cancelAnimationFrame(raf)
  }, [expanded])

  if (team.weeks.length === 0) return null

  const clampedWeek = Math.min(weekIndex, team.weeks.length - 1)
  const week = team.weeks[clampedWeek]
  const isCurrentWeek = clampedWeek === team.weeks.length - 1
  const total = team.memberCount
  const goWeek = (step: number) =>
    setWeekIndex((i) => Math.min(team.weeks.length - 1, Math.max(0, i + step)))

  const firstFuture = week.counts.findIndex((c) => c === null)
  const todayIndex = !isCurrentWeek
    ? -1
    : firstFuture === -1
      ? week.counts.length - 1
      : firstFuture - 1
  const latestWeek = team.weeks[team.weeks.length - 1]
  const latestFirstFuture = latestWeek.counts.findIndex((c) => c === null)
  const latestTodayIndex =
    (latestFirstFuture === -1 ? latestWeek.counts.length : latestFirstFuture) - 1
  const todayCount = latestTodayIndex >= 0 ? (latestWeek.counts[latestTodayIndex] ?? 0) : 0

  return (
    <div className="rounded-[18px] border border-border overflow-hidden bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 px-3.5 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        {rank <= 3 ? (
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
            style={{ background: RANK_BG[rank - 1], color: RANK_TEXT[rank - 1] }}
          >
            {rank}
          </span>
        ) : (
          <span className="w-6 text-center text-[12px] font-bold text-muted shrink-0">{rank}</span>
        )}
        <TeamAvatar imageUrl={null} name={team.teamName} size="sm" />
        <span className="flex-1 min-w-0">
          <p className="text-[13.5px] font-bold text-ink truncate">
            {team.teamName}
            {tied && <span className="ml-1 text-[10px] font-semibold text-muted">공동</span>}
          </p>
          <p className="text-[11px] text-muted mt-0.5 flex items-center gap-0.5">
            <IoFlame size={11} className="text-secondary-50 shrink-0" />
            {team.streakDays}일 연속 · 오늘 참여 {todayCount}/{total}명
          </p>
        </span>
        <div className="flex gap-[3px] shrink-0">
          {latestWeek.counts.map((c, i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: c && c > 0 ? HONEY[3] : '#e9e9ec' }}
            />
          ))}
        </div>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 shrink-0 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-border px-3.5 pt-3.5 pb-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[12px] font-bold text-ink whitespace-nowrap">
              {formatWeekLabel(week.startDate, isCurrentWeek)}
            </span>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => goWeek(-1)}
                disabled={clampedWeek === 0}
                className="w-6 h-6 flex items-center justify-center rounded-full active:scale-[0.94] disabled:opacity-35"
                aria-label="이전 주"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M10 3.5L5.5 8L10 12.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                onClick={() => goWeek(1)}
                disabled={isCurrentWeek}
                className="w-6 h-6 flex items-center justify-center rounded-full active:scale-[0.94] disabled:opacity-35"
                aria-label="다음 주"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6 3.5L10.5 8L6 12.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-end gap-1.5 h-[84px]">
            {DAYS.map((day, i) => {
              const n = week.counts[i]
              const future = n === null
              const empty = !future && n === 0
              const pct = future ? 0 : (n as number) / total
              const isToday = i === todayIndex
              return (
                <div key={day} className="flex-1 min-w-0 flex flex-col items-center gap-[6px]">
                  <span
                    className={`text-[9px] font-semibold ${
                      future || empty ? 'text-neutral-50' : isToday ? 'text-ink' : 'text-neutral-60'
                    }`}
                  >
                    {future ? '·' : `${n}/${total}`}
                  </span>
                  <div className="relative w-full">
                    <div
                      className={`w-full rounded-md transition-[height] duration-700 ease-out ${isToday ? 'today-pulse' : ''}`}
                      style={{
                        height: risen ? (future ? 8 : Math.round(12 + pct * 48)) : 0,
                        background:
                          future || empty ? HONEY[0] : HONEY[Math.min(3, Math.ceil(pct * 3))],
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex gap-1.5 mt-1.5">
            {DAYS.map((day, i) => {
              const future = week.counts[i] === null
              const isToday = i === todayIndex
              return (
                <span
                  key={day}
                  className={`flex-1 min-w-0 text-center text-[10px] ${
                    future
                      ? 'text-neutral-50 font-medium'
                      : isToday
                        ? 'text-ink font-extrabold'
                        : 'text-muted font-medium'
                  }`}
                >
                  {day}
                </span>
              )
            })}
          </div>

          <div className="flex items-center justify-between gap-2.5 mt-3.5 pt-3 border-t border-neutral-30">
            <span className="text-[10.5px] text-neutral-60">진행 또는 완료를 남긴 팀원 기준</span>
            <div className="flex items-center gap-[6px] shrink-0">
              <span className="text-[10.5px] text-muted whitespace-nowrap">오늘</span>
              <div className="flex">
                {team.todayMembers.slice(0, 3).map((m) => (
                  <div
                    key={m.userId}
                    className="w-5 h-5 -ml-1.5 rounded-full border-2 border-white bg-neutral-40 flex items-center justify-center text-[8px] font-bold text-neutral-100"
                  >
                    {m.name.slice(0, 1)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface TeamRhythmListProps {
  teams: TeamRhythm[]
  /** 배너(트로피 카드)를 숨기고 싶을 때 — 이미 다른 안내가 있는 자리(피드 탭 등)에서 쓴다 */
  hideBanner?: boolean
}

/** 팀별 순위 · 요일 리듬을 펼쳐볼 수 있는 목록. 팀 리듬 상세 화면과 기록 탭의 "팀" 뷰가 함께 쓴다 */
export function TeamRhythmList({ teams, hideBanner = false }: TeamRhythmListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const ranked = withRanks(teams)

  return (
    <>
      {!hideBanner && (
        <div
          className="mx-5 mt-3 rounded-[22px] overflow-hidden relative border border-white flex flex-col items-center py-6"
          style={{ background: 'linear-gradient(155deg,#9dc0ff 0%,#6699ff 100%)' }}
        >
          <Image src="/images/decor/trophy.svg" alt="" width={180} height={180} unoptimized />
          <p className="mt-2 text-[15px] font-black text-white text-center leading-snug">
            우리 팀의
            <br />
            꾸준함을 비교해보세요!
          </p>
        </div>
      )}

      {teams.length === 0 ? (
        <p className="mx-5 mt-6 text-[13px] text-muted text-center">아직 활동 기록이 없어요.</p>
      ) : (
        <div className="flex flex-col gap-2 mx-5 mt-4">
          {ranked.map(({ team, rank, tied }) => (
            <TeamRow
              key={team.teamId}
              rank={rank}
              tied={tied}
              team={team}
              expanded={expandedId === team.teamId}
              onToggle={() => setExpandedId((id) => (id === team.teamId ? null : team.teamId))}
            />
          ))}
        </div>
      )}
    </>
  )
}
