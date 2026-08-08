import type { MonthlyHive } from '@/types/feed.types'
import { HONEY } from './TeamRhythmCard'

const HEX_CLIP = 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)'
const COLS = 8
const CELL_W = 20
const CELL_H = 22
const GAP = 2

interface Props {
  hive: MonthlyHive
}

/** 이번 달 벌집 채우기 — 하루 = 1칸, 그날 완료 개수만큼 꿀이 진해진다 */
export function MonthlyHiveCard({ hive }: Props) {
  const { month, dayLevels, currentStreak } = hive
  const total = dayLevels.length
  const filled = dayLevels.filter((lv) => lv !== null && lv > 0).length
  const firstFuture = dayLevels.findIndex((lv) => lv === null)
  const todayIndex = (firstFuture === -1 ? total : firstFuture) - 1
  const rows = Math.ceil(total / COLS)

  return (
    <section className="mx-5 mt-3.5 bg-white rounded-[24px] border border-[#f1e6cd] p-5">
      <div className="flex items-start justify-between">
        <h2 className="text-[16px] font-black text-ink tracking-[-0.2px]">{month}월의 벌집</h2>
        <span className="shrink-0 text-[12px] font-bold text-[#b45309]">
          <span className="font-mono">{filled}</span> / {total}칸
        </span>
      </div>
      <p className="text-[12px] text-muted mt-0.5">하루 한 칸 — 많이 완료한 날은 꿀이 진해져요</p>

      <div className="flex justify-center mt-4 pb-[13px]">
        {Array.from({ length: COLS }, (_, c) => (
          <div
            key={c}
            className="flex flex-col"
            style={{
              gap: GAP,
              marginLeft: c > 0 ? -1 : 0,
              transform: c % 2 === 1 ? `translateY(${CELL_H / 2 + GAP / 2}px)` : undefined,
            }}
          >
            {Array.from({ length: rows }, (_, r) => {
              const day = r * COLS + c
              if (day >= total) {
                return (
                  <div key={r} style={{ width: CELL_W, height: CELL_H, visibility: 'hidden' }} />
                )
              }
              const lv = dayLevels[day]
              const isToday = day === todayIndex
              const bg = lv === null ? '#faf6ea' : HONEY[lv]
              if (isToday) {
                return (
                  <div
                    key={r}
                    title={`${month}월 ${day + 1}일 · 오늘`}
                    className="flex items-center justify-center"
                    style={{
                      width: CELL_W,
                      height: CELL_H,
                      clipPath: HEX_CLIP,
                      background: '#92600f',
                    }}
                  >
                    <div
                      style={{
                        width: CELL_W - 5,
                        height: CELL_H - 5,
                        clipPath: HEX_CLIP,
                        background: bg,
                      }}
                    />
                  </div>
                )
              }
              return (
                <div
                  key={r}
                  title={`${month}월 ${day + 1}일`}
                  style={{ width: CELL_W, height: CELL_H, clipPath: HEX_CLIP, background: bg }}
                />
              )
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] font-bold text-[#92600f]">
          {currentStreak}일 연속 꿀 모으는 중
        </span>
        <div className="flex items-center gap-[5px] text-[10px] text-[#a89f8d]">
          <span>묽은 꿀</span>
          {HONEY.slice(1).map((bg) => (
            <div key={bg} style={{ width: 11, height: 12, clipPath: HEX_CLIP, background: bg }} />
          ))}
          <span>진한 꿀</span>
        </div>
      </div>
    </section>
  )
}
