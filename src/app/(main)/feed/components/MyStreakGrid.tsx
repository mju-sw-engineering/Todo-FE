'use client'

import type { MyStreak } from '@/types/feed.types'
import { GRASS } from './TeamRhythmCard'

const ROW_LABELS = ['월', '', '수', '', '금', '', '']
const COUNT_LABELS = ['기록 없음', '1개', '2개', '3개 이상']

interface Props {
  streak: MyStreak
}

/** days는 오래된 날 → 오늘 순서, 월요일 시작으로 정렬되어 있다고 가정 (16주 = 112일) */
export function MyStreakGrid({ streak }: Props) {
  const weeks: (typeof streak.days)[] = []
  for (let i = 0; i < streak.days.length; i += 7) {
    weeks.push(streak.days.slice(i, i + 7))
  }

  const monthLabels = weeks
    .filter((_, i) => i % 4 === 0)
    .map((w) => new Date(w[0].date).toLocaleDateString('en-US', { month: 'short' }))

  // toISOString()은 UTC라 KST 오전 9시 전엔 어제가 되므로 로컬 날짜로 만든다.
  const now = new Date()
  const todayISO = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')

  return (
    <section className="mx-5 mt-3.5 bg-white rounded-[24px] border border-border p-5">
      <div className="flex items-start justify-between mb-3.5">
        <h2 className="text-[16px] font-black text-ink tracking-[-0.2px]">나의 꾸준함</h2>
      </div>
      <p className="text-[12px] text-muted mb-3">어느 팀에서든 투두를 남긴 날</p>

      <div className="flex gap-[3px] mb-1 pl-[21px]">
        {monthLabels.map((m, i) => (
          <span
            key={i}
            className="flex-1 font-mono text-[10px] tracking-[0.8px] text-[#ababab] uppercase"
          >
            {m}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-[3px]">
        {ROW_LABELS.map((label, day) => (
          <div key={day} className="flex gap-[3px] items-center">
            <span className="w-[18px] shrink-0 text-[10px] leading-none text-[#ababab]">
              {label}
            </span>
            {weeks.map((w, wi) => {
              const cell = w[day]
              if (!cell) return <div key={wi} className="flex-1 aspect-square min-w-0" />
              const isToday = cell.date === todayISO
              const isFuture = cell.date > todayISO
              const lv = isFuture ? 0 : cell.level
              return (
                <div
                  key={wi}
                  title={isFuture ? '아직 오지 않은 날' : `${cell.date} · ${COUNT_LABELS[lv]}`}
                  className="flex-1 aspect-square min-w-0 rounded-[2px]"
                  style={{
                    background: GRASS[lv],
                    boxShadow: isToday ? 'inset 0 0 0 1.5px #111111' : 'none',
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3.5">
        <span className="text-[11px] font-bold text-ink">현재 {streak.currentStreak}일 연속</span>
        <div className="flex items-center gap-[5px]">
          <span className="font-mono text-[10px] tracking-[0.8px] text-[#ababab] uppercase">
            Less
          </span>
          {GRASS.map((bg) => (
            <div key={bg} className="w-2.5 h-2.5 rounded-[2px]" style={{ background: bg }} />
          ))}
          <span className="font-mono text-[10px] tracking-[0.8px] text-[#ababab] uppercase">
            More
          </span>
        </div>
      </div>
    </section>
  )
}
