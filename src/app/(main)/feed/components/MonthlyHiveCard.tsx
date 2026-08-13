import { HiveIcon } from '@/components/ui/HiveIcon'
import type { MonthlyHive } from '@/types/feed.types'

const FILL_HONEY = '#ffe042' // 브랜드 옐로우 — 활동한 날은 이 한 가지 색으로 통일
const WAX_EMPTY = '#f4f4f4' // 빈 칸(밀랍) — neutral-30
const WALL_HONEY = '#eda020' // 채운 칸 벽 — HiveIcon과 같은 진한 금색
const WALL_EMPTY = '#e9e9ec' // 빈 칸 벽 — border
const TODAY_RING = '#ff7a29' // secondary-50

/* 기하 — pointy-top 육각형, 완벽 밀착 배치 */
const R = 30
const PER_ROW = 8
const HEX_W = Math.sqrt(3) * R
const H_STEP = HEX_W
const V_STEP = 1.5 * R
const PAD = 7
const ORIGIN_X = PAD + HEX_W / 2
const ORIGIN_Y = PAD + R

/** 원점 기준 육각형 꼭짓점 (모든 칸 공유) */
const HEX_POINTS = Array.from({ length: 6 }, (_, i) => {
  const a = ((60 * i - 90) * Math.PI) / 180
  return `${(R * Math.cos(a)).toFixed(2)},${(R * Math.sin(a)).toFixed(2)}`
}).join(' ')

interface Props {
  hive: MonthlyHive
}

/** 이번 달 벌집 채우기 — 하루 = 1칸, 그날 투두를 손댔으면(생성·체크인·제출) 채워진다 */
export function MonthlyHiveCard({ hive }: Props) {
  const { month, dayLevels, currentStreak } = hive
  const total = dayLevels.length
  const filled = dayLevels.filter((lv) => lv !== null && lv > 0).length
  const firstFuture = dayLevels.findIndex((lv) => lv === null)
  const todayIndex = (firstFuture === -1 ? total : firstFuture) - 1
  const rows = Math.ceil(total / PER_ROW)

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

  return (
    <section className="mx-5 mt-3.5 bg-white rounded-[24px] border border-border p-5">
      <div className="flex items-start justify-between">
        <h2 className="text-[16px] font-black text-ink tracking-[-0.2px] flex items-center gap-1.5">
          <HiveIcon size={16} />
          {month}월의 벌집
        </h2>
        <span className="shrink-0 text-[12px] font-bold text-ink">
          <span className="font-mono">{filled}</span> / {total}칸
        </span>
      </div>
      <p className="text-[12px] text-muted mt-0.5">하루 한 칸 — 기록한 날은 꿀로 채워져요</p>

      <svg
        viewBox={`0 0 ${vbW.toFixed(1)} ${vbH.toFixed(1)}`}
        width="100%"
        style={{ display: 'block', marginTop: 16, overflow: 'visible' }}
        role="img"
        aria-label={`${total}칸 중 ${filled}칸 채움`}
      >
        {cells.map((c) => {
          const isFilled = c.level !== null && c.level > 0
          const isToday = c.day === todayIndex + 1
          return (
            <g key={c.day} transform={`translate(${c.cx.toFixed(2)},${c.cy.toFixed(2)})`}>
              <title>{`${month}월 ${c.day}일${isFilled ? ' · 기록함' : ''}${isToday ? ' · 오늘' : ''}`}</title>
              <g className="transition-transform duration-150 [transform-box:fill-box] [transform-origin:center] hover:scale-[1.07]">
                <polygon
                  points={HEX_POINTS}
                  fill={isFilled ? FILL_HONEY : WAX_EMPTY}
                  stroke={isFilled ? WALL_HONEY : WALL_EMPTY}
                  strokeWidth={3.6}
                  strokeLinejoin="round"
                  style={{ transition: 'fill 480ms ease, stroke 480ms ease' }}
                />
                {isToday && (
                  <polygon
                    points={HEX_POINTS}
                    fill="none"
                    stroke={isFilled ? '#ffffff' : TODAY_RING}
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

      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] font-bold text-ink">{currentStreak}일 연속 꿀 모으는 중</span>
        <div className="flex items-center gap-1.5 text-[10px] text-muted">
          <span
            className="inline-block"
            style={{
              width: 11,
              height: 12,
              clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)',
              background: FILL_HONEY,
            }}
          />
          <span>기록한 날</span>
        </div>
      </div>
    </section>
  )
}
