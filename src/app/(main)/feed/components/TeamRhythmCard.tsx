'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { HiveIcon } from '@/components/ui/HiveIcon'
import type { TeamRhythm } from '@/types/feed.types'

const DAYS = ['월', '화', '수', '목', '금', '토', '일']

/** 벌집 채우기와 공유하는 꿀 팔레트 4단계 (참여 없음 → 많음). 브랜드 옐로우 #ffe042를 최대 진하기로 두고 같은 색상으로만 옅어진다 */
export const HONEY = ['#faf0d2', '#ffe9a0', '#ffdd66', '#ffe042']

function formatWeekLabel(startDate: string, isCurrent: boolean) {
  const start = new Date(startDate)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const f = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`
  const sameMonth = start.getMonth() === end.getMonth()
  const range = sameMonth ? `${f(start)} – ${end.getDate()}일` : `${f(start)} – ${f(end)}`
  return isCurrent ? `이번 주 · ${range}` : range
}

interface Props {
  teams: TeamRhythm[]
}

export function TeamRhythmCard({ teams }: Props) {
  const [teamIndex, setTeamIndex] = useState(0)
  const team: TeamRhythm | undefined = teams[Math.min(teamIndex, teams.length - 1)]
  const [weekIndex, setWeekIndex] = useState(() => (team ? team.weeks.length - 1 : 0))
  const swipeX = useRef<number | null>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const [tabFade, setTabFade] = useState({ left: false, right: false })

  // 막대가 0에서 목표 높이까지 차오르는 모션 — 마운트 시점에 0으로 그렸다가
  // 다음 프레임에 실제 높이로 올려서 transition이 타도록 한다
  const [risen, setRisen] = useState(false)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setRisen(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const updateTabFade = () => {
    const el = tabsRef.current
    if (!el) return
    setTabFade({
      left: el.scrollLeft > 1,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    })
  }

  useEffect(() => {
    updateTabFade()
  }, [teams])

  if (!team) return null
  if (team.weeks.length === 0) {
    return (
      <section className="mx-5 bg-white rounded-[24px] border border-border p-5">
        <h2 className="text-[16px] font-black text-ink tracking-[-0.2px] mb-2">우리의 꾸준함</h2>
        <p className="text-[13px] text-muted">아직 활동 기록이 없어요.</p>
      </section>
    )
  }

  const clampedWeek = Math.min(weekIndex, team.weeks.length - 1)
  const week = team.weeks[clampedWeek]
  const isCurrentWeek = clampedWeek === team.weeks.length - 1
  const total = team.memberCount

  const goWeek = (step: number) =>
    setWeekIndex((i) => Math.min(team.weeks.length - 1, Math.max(0, i + step)))

  // 오늘 = 첫 null(미래) 바로 앞. 일요일엔 null이 없으므로 마지막 칸이 오늘이다.
  const firstFuture = week.counts.findIndex((c) => c === null)
  const todayIndex = !isCurrentWeek
    ? -1
    : firstFuture === -1
      ? week.counts.length - 1
      : firstFuture - 1
  const todayCount = todayIndex >= 0 ? week.counts[todayIndex] : null
  const doneCount = week.counts.reduce<number>((a, b) => a + (b ?? 0), 0)

  return (
    <section className="mx-5 bg-white rounded-[24px] border border-border p-5">
      <div className="flex items-start justify-between mb-0.5">
        <h2 className="text-[16px] font-black text-ink tracking-[-0.2px] flex items-center gap-1.5">
          <HiveIcon size={16} />
          우리의 꾸준함
        </h2>
        <span className="shrink-0 whitespace-nowrap text-[12px] font-bold text-ink">
          {isCurrentWeek && todayCount !== null
            ? `오늘 ${todayCount} / ${total}명`
            : `참여 ${doneCount}회`}
        </span>
      </div>

      {/* 팀 1개면 이름만, 2개 이상이면 탭 */}
      <div className="flex items-center gap-2 my-4">
        {teams.length === 1 ? (
          <>
            <span className="w-[26px] h-[26px] shrink-0 rounded-full bg-neutral-40 flex items-center justify-center text-[10px] font-bold text-neutral-100">
              {team.teamName.slice(0, 2)}
            </span>
            <span className="text-[14px] font-bold text-ink whitespace-nowrap">
              {team.teamName}
            </span>
          </>
        ) : (
          <div
            ref={tabsRef}
            onScroll={updateTabFade}
            className="flex-1 min-w-0 -ml-5 pl-5 scroll-pl-5 flex gap-1.5 overflow-x-auto scrollbar-hidden snap-x snap-mandatory fade-edges-x"
            style={
              {
                '--fade-left': tabFade.left ? '20px' : '0px',
                '--fade-right': tabFade.right ? '28px' : '0px',
              } as CSSProperties
            }
          >
            {teams.map((t, i) => {
              const active = i === Math.min(teamIndex, teams.length - 1)
              return (
                <button
                  key={t.teamId}
                  onClick={(e) => {
                    setTeamIndex(i)
                    setWeekIndex(t.weeks.length - 1)
                    e.currentTarget.scrollIntoView({
                      behavior: 'smooth',
                      inline: 'start',
                      block: 'nearest',
                    })
                  }}
                  className={`shrink-0 snap-start flex items-center gap-1.5 pl-[5px] pr-[11px] py-[5px] rounded-full border active:scale-[0.97] transition-transform ${
                    active ? 'border-ink bg-surface' : 'border-border bg-white'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-neutral-40 flex items-center justify-center text-[9px] font-bold text-neutral-100">
                    {t.teamName.slice(0, 2)}
                  </span>
                  <span
                    className={`text-[12.5px] font-bold whitespace-nowrap ${
                      active ? 'text-ink' : 'text-muted'
                    }`}
                  >
                    {t.teamName}
                  </span>
                </button>
              )
            })}
          </div>
        )}
        <span className="flex-1" />
        <span className="shrink-0 whitespace-nowrap text-[12px] text-muted">
          <span className="font-mono font-bold text-ink">{team.streakDays}</span>일 연속
        </span>
      </div>

      {/* 주 이동 */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="text-[12.5px] font-bold text-ink whitespace-nowrap">
          {formatWeekLabel(week.startDate, isCurrentWeek)}
        </span>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => goWeek(-1)}
            disabled={clampedWeek === 0}
            className="w-6 h-6 flex items-center justify-center rounded-full active:scale-[0.94] disabled:opacity-35"
            aria-label="이전 주"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
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
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
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

      {/* 요일별 막대 — 좌우 스와이프로 주 이동 */}
      <div
        className="touch-pan-y"
        onPointerDown={(e) => {
          swipeX.current = e.clientX
        }}
        onPointerUp={(e) => {
          if (swipeX.current === null) return
          const dx = e.clientX - swipeX.current
          swipeX.current = null
          if (Math.abs(dx) < 40) return
          goWeek(dx > 0 ? -1 : 1)
        }}
      >
        <div className="flex items-end gap-1.5 h-[104px]">
          {DAYS.map((day, i) => {
            const n = week.counts[i]
            const future = n === null
            const empty = !future && n === 0
            const pct = future ? 0 : (n as number) / total
            const isToday = i === todayIndex
            return (
              <div key={day} className="flex-1 min-w-0 flex flex-col items-center gap-[7px]">
                <span
                  className={`font-mono text-[10px] font-semibold ${
                    future || empty ? 'text-neutral-50' : isToday ? 'text-ink' : 'text-neutral-60'
                  }`}
                >
                  {future ? '·' : `${n}/${total}`}
                </span>
                <div className="relative w-full">
                  <div
                    className={`w-full rounded-md transition-[height] duration-700 ease-out ${
                      isToday ? 'today-pulse' : ''
                    }`}
                    style={{
                      height: risen ? (future ? 10 : Math.round(16 + pct * 62)) : 0,
                      background:
                        future || empty ? HONEY[0] : HONEY[Math.min(3, Math.ceil(pct * 3))],
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex gap-1.5 mt-2">
          {DAYS.map((day, i) => {
            const future = week.counts[i] === null
            const isToday = i === todayIndex
            return (
              <span
                key={day}
                className={`flex-1 min-w-0 text-center text-[11px] ${
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
      </div>

      <div className="flex items-center justify-between gap-2.5 mt-4 pt-3.5 border-t border-neutral-30">
        <span className="text-[11px] text-neutral-60">진행 또는 완료를 남긴 팀원 기준</span>
        <div className="flex items-center gap-[7px] shrink-0">
          <span className="text-[11px] text-muted whitespace-nowrap">오늘</span>
          <div className="flex">
            {team.todayMembers.slice(0, 3).map((m) => (
              <div
                key={m.userId}
                className="w-6 h-6 -ml-1.5 rounded-full border-2 border-white bg-neutral-40 flex items-center justify-center text-[9px] font-bold text-neutral-100"
              >
                {m.name.slice(0, 1)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
