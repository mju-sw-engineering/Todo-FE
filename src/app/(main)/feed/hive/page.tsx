'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { FiCheckCircle, FiLock } from 'react-icons/fi'
import { IoFlame } from 'react-icons/io5'
import { BackButton } from '@/components/ui/BackButton'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { BeePose } from '@/components/bee/BeePose'
import { PageLoader } from '@/components/ui/PageLoader'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { getBadges, getMonthlyHive, getTeamRhythms } from '@/services/feedService'
import { useAuth } from '@/store/authStore'
import type { FeedBadge, MonthlyHive, StreakLevel, TeamRhythm } from '@/types/feed.types'
import {
  HEX_CLIP,
  HIVE_EMPTY,
  HIVE_EMPTY_WALL,
  HIVE_FILL,
  HIVE_WALL,
  TODAY_ACCENT,
} from '../components/palette'

const R = 30
const PER_ROW = 8
const HEX_W = Math.sqrt(3) * R
const H_STEP = HEX_W
const V_STEP = 1.5 * R
const PAD = 7
const ORIGIN_X = PAD + HEX_W / 2
const ORIGIN_Y = PAD + R

const HEX_POINTS = Array.from({ length: 6 }, (_, i) => {
  const a = ((60 * i - 90) * Math.PI) / 180
  return `${(R * Math.cos(a)).toFixed(2)},${(R * Math.sin(a)).toFixed(2)}`
}).join(' ')

const LEVEL_LABEL: Record<StreakLevel, string> = {
  0: '기록 없음',
  1: '1단계',
  2: '2단계',
  3: '3단계',
}

/** "N일 연속" 형태의 배지 라벨에서 목표 일수를 뽑는다 — 없는 숫자는 만들지 않는다 */
function streakMilestones(badges: FeedBadge[]) {
  return badges
    .map((b) => {
      const m = b.label.match(/^(\d+)일 연속$/)
      return m ? { days: Number(m[1]), acquired: b.acquired } : null
    })
    .filter((v): v is { days: number; acquired: boolean } => v !== null)
    .sort((a, b) => a.days - b.days)
}

function todayParticipation(team: TeamRhythm | undefined) {
  if (!team || team.weeks.length === 0) return null
  const week = team.weeks[team.weeks.length - 1]
  const firstFuture = week.counts.findIndex((c) => c === null)
  const todayIndex = firstFuture === -1 ? week.counts.length - 1 : firstFuture - 1
  const count = todayIndex >= 0 ? (week.counts[todayIndex] ?? 0) : 0
  return { count, total: team.memberCount, members: team.todayMembers }
}

export default function HiveDetailPage() {
  const router = useRouter()
  const { token } = useAuth()
  const { isLoading, run } = useAsyncTask(true)

  const [hive, setHive] = useState<MonthlyHive | null>(null)
  const [badges, setBadges] = useState<FeedBadge[]>([])
  const [teams, setTeams] = useState<TeamRhythm[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  useEffect(() => {
    if (!token) return
    run(async () => {
      const [h, b, t] = await Promise.all([
        getMonthlyHive(token),
        getBadges(token).catch(() => []),
        getTeamRhythms(token).catch(() => []),
      ])
      setHive(h)
      setBadges(b)
      setTeams(t)
    })
  }, [token, run])

  if (isLoading || !hive) return <PageLoader />

  const { month, dayLevels, currentStreak } = hive
  const total = dayLevels.length
  const filled = dayLevels.filter((lv) => lv !== null && lv > 0).length
  const firstFuture = dayLevels.findIndex((lv) => lv === null)
  const todayIndex = (firstFuture === -1 ? total : firstFuture) - 1
  const rows = Math.ceil(total / PER_ROW)
  const selectedLevel = selectedDay != null ? dayLevels[selectedDay - 1] : null

  const cells = dayLevels.map((level, d) => {
    const row = Math.floor(d / PER_ROW)
    const col = d % PER_ROW
    return {
      day: d + 1,
      level,
      cx: ORIGIN_X + col * H_STEP + (row % 2) * (H_STEP / 2),
      cy: ORIGIN_Y + row * V_STEP,
    }
  })
  const vbW = ORIGIN_X + (PER_ROW - 1) * H_STEP + H_STEP / 2 + HEX_W / 2 + PAD
  const vbH = ORIGIN_Y + (rows - 1) * V_STEP + R + PAD

  const today = todayParticipation(teams[0])
  const milestones = streakMilestones(badges)

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-fade-up">
      <div className="flex-1 overflow-y-auto scrollbar-hidden">
        <div className="px-5 pt-6 pb-2 flex items-center gap-2">
          <BackButton onClick={() => router.push('/feed')} />
          <h1 className="text-[18px] font-black text-ink">{month}월의 벌집</h1>
        </div>

        <div className="px-5 mt-3 flex items-center justify-between">
          <p className="text-[15px] font-black text-ink flex items-center gap-1">
            <IoFlame size={16} className="text-secondary-50" />
            {filled} / {total}칸
          </p>
          <BeePose pose="search" size={56} />
        </div>
        <p className="px-5 mt-1 text-[12.5px] text-muted">
          하루 한 칸 기록하면 벌집이 하나씩 채워져요.
        </p>

        <svg
          viewBox={`0 0 ${vbW.toFixed(1)} ${vbH.toFixed(1)}`}
          width="100%"
          style={{ display: 'block', marginTop: 20, padding: '0 20px', overflow: 'visible' }}
          role="img"
          aria-label={`${total}칸 중 ${filled}칸 채움`}
        >
          {cells.map((c) => {
            const isFilled = c.level !== null && c.level > 0
            const isPast = c.level !== null
            const isToday = c.day === todayIndex + 1
            return (
              <g
                key={c.day}
                transform={`translate(${c.cx.toFixed(2)},${c.cy.toFixed(2)})`}
                onClick={isPast ? () => setSelectedDay(c.day) : undefined}
                style={{ cursor: isPast ? 'pointer' : 'default' }}
              >
                <title>{`${month}월 ${c.day}일${isFilled ? ' · 기록함' : ''}${isToday ? ' · 오늘' : ''}`}</title>
                <g className="transition-transform duration-150 [transform-box:fill-box] [transform-origin:center] hover:scale-[1.06] active:scale-95">
                  <polygon
                    points={HEX_POINTS}
                    fill={isFilled ? HIVE_FILL : HIVE_EMPTY}
                    stroke={isFilled ? HIVE_WALL : HIVE_EMPTY_WALL}
                    strokeWidth={3.6}
                    strokeLinejoin="round"
                    style={{ transition: 'fill 480ms ease, stroke 480ms ease' }}
                  />
                  {isToday && (
                    <polygon
                      points={HEX_POINTS}
                      fill="none"
                      stroke={isFilled ? '#ffffff' : TODAY_ACCENT}
                      strokeOpacity={isFilled ? 0.85 : 1}
                      strokeWidth={2.4}
                      strokeDasharray={isFilled ? '0' : '3 3'}
                      pointerEvents="none"
                      className="today-pulse"
                      style={{
                        transform: 'scale(0.7)',
                        transformBox: 'fill-box',
                        transformOrigin: 'center',
                      }}
                    />
                  )}
                </g>
              </g>
            )
          })}
        </svg>

        <div className="px-5 mt-3 flex items-center gap-1.5 text-[10px] text-muted">
          <span
            className="inline-block"
            style={{ width: 11, height: 12, clipPath: HEX_CLIP, background: HIVE_FILL }}
          />
          <span>기록한 날 · 칸을 눌러 확인해보세요</span>
        </div>

        {today && (
          <div className="mx-5 mt-5 bg-surface rounded-[18px] p-4 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-ink">오늘 함께한 팀원</p>
              <p className="text-[12px] text-muted mt-0.5">
                {today.count} / {today.total}명
              </p>
            </div>
            {today.members.length > 0 && (
              <div className="flex">
                {today.members.slice(0, 4).map((m) => (
                  <div
                    key={m.userId}
                    className="w-7 h-7 -ml-2 first:ml-0 rounded-full border-2 border-white bg-neutral-40 flex items-center justify-center text-[11px] font-bold text-neutral-100"
                    title={m.name}
                  >
                    {m.name.slice(0, 1)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mx-5 mt-3 mb-6 bg-[linear-gradient(155deg,#fff6dd_0%,#ffedb0_100%)] rounded-[18px] p-4">
          <p className="text-[13px] font-black text-ink flex items-center gap-1">
            <IoFlame size={15} className="text-secondary-50" />
            현재 {currentStreak}일 연속
          </p>
          <p className="text-[11.5px] text-[#7a5c00] mt-1">
            꾸준히 기록하면 벌집이 더 빠르게 채워져요.
          </p>
          {milestones.length > 0 && (
            <div className="flex items-center gap-2 mt-3.5">
              {milestones.map((m) => (
                <div key={m.days} className="flex-1 flex flex-col items-center gap-1">
                  {currentStreak >= m.days ? (
                    <IoFlame size={16} className="text-secondary-50" />
                  ) : m.acquired ? (
                    <FiCheckCircle size={15} className="text-primary" />
                  ) : (
                    <FiLock size={14} className="text-[#b3a06a]" />
                  )}
                  <span className="text-[10px] font-semibold text-[#7a5c00]">{m.days}일</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedDay != null && (
          <BottomSheet onClose={() => setSelectedDay(null)}>
            <p className="text-[13px] font-bold text-muted text-center">
              {month}월 {selectedDay}일
            </p>
            <p className="mt-2 text-[22px] font-black text-ink text-center">
              {selectedLevel != null && selectedLevel > 0
                ? LEVEL_LABEL[selectedLevel]
                : '기록 없음'}
            </p>
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="mt-6 w-full rounded-2xl bg-primary py-3 text-[14px] font-bold text-white"
            >
              확인
            </button>
          </BottomSheet>
        )}
      </AnimatePresence>
    </div>
  )
}
