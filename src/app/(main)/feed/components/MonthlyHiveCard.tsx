import type { MonthlyHive } from '@/types/feed.types'
import { HONEY } from './TeamRhythmCard'

const HEX_CLIP = 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)'
const COLS = 8
// 카드 안쪽 너비(약 310px)를 실제로 채우도록 셀을 키운다 — 예전 20px 셀은 그리드가
// 가운데에 작게 뭉쳐 보이는 문제가 있었다
const CELL_W = 38
const CELL_H = 42
// 뾰족한 위·아래 꼭짓점을 가진 육각형이 실제 벌집처럼 이가 맞물리려면 칸 사이에
// 틈이 있으면 안 된다. 열 간격은 셀 너비의 3/4, 짝수 열은 셀 높이의 절반만큼
// 내려와야 위아래 대각선 변이 정확히 맞닿는다.
const COL_STEP = (CELL_W * 3) / 4
const ROW_OFFSET = CELL_H / 2

interface Props {
  hive: MonthlyHive
}

/** 이번 달 벌집 채우기 — 하루 = 1칸, 그날 손댄(생성·체크인·제출) 투두 수만큼 꿀이 진해진다 */
export function MonthlyHiveCard({ hive }: Props) {
  const { month, dayLevels, currentStreak } = hive
  const total = dayLevels.length
  const filled = dayLevels.filter((lv) => lv !== null && lv > 0).length
  const firstFuture = dayLevels.findIndex((lv) => lv === null)
  const todayIndex = (firstFuture === -1 ? total : firstFuture) - 1
  const rows = Math.ceil(total / COLS)

  return (
    <section className="mx-5 mt-3.5 bg-white rounded-[24px] border border-border p-5">
      <div className="flex items-start justify-between">
        <h2 className="text-[16px] font-black text-ink tracking-[-0.2px]">{month}월의 벌집</h2>
        <span className="shrink-0 text-[12px] font-bold text-ink">
          <span className="font-mono">{filled}</span> / {total}칸
        </span>
      </div>
      <p className="text-[12px] text-muted mt-0.5">하루 한 칸 — 기록한 만큼 꿀이 진해져요</p>

      <div className="flex justify-center mt-4 pb-[13px]">
        {Array.from({ length: COLS }, (_, c) => (
          <div
            key={c}
            className="flex flex-col"
            style={{
              marginLeft: c > 0 ? -(CELL_W - COL_STEP) : 0,
              transform: c % 2 === 1 ? `translateY(${ROW_OFFSET}px)` : undefined,
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
              const bg = lv === null ? '#f4f4f4' : HONEY[lv]
              return (
                <div
                  key={r}
                  title={`${month}월 ${day + 1}일${isToday ? ' · 오늘' : ''}`}
                  className={isToday ? 'today-pulse' : ''}
                  style={{ width: CELL_W, height: CELL_H, clipPath: HEX_CLIP, background: bg }}
                />
              )
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] font-bold text-ink">{currentStreak}일 연속 꿀 모으는 중</span>
        <div className="flex items-center gap-[5px] text-[10px] text-muted">
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
