'use client'

import { useRouter } from 'next/navigation'
import { HiveIcon } from '@/components/ui/HiveIcon'
import type { MonthlyHive } from '@/types/feed.types'
import { HIVE_EMPTY, HIVE_EMPTY_WALL, HIVE_FILL, HIVE_WALL } from './palette'

/* 미리보기용 — 상세 화면(PER_ROW 8)과 같은 비율로, 칸 수만 적게 보여준다 */
const R = 20
const PER_ROW = 8
const HEX_W = Math.sqrt(3) * R
const H_STEP = HEX_W
const V_STEP = 1.5 * R
const PAD = 4
const ORIGIN_X = PAD + HEX_W / 2
const ORIGIN_Y = PAD + R

const HEX_POINTS = Array.from({ length: 6 }, (_, i) => {
  const a = ((60 * i - 90) * Math.PI) / 180
  return `${(R * Math.cos(a)).toFixed(2)},${(R * Math.sin(a)).toFixed(2)}`
}).join(' ')

interface Props {
  hive: MonthlyHive
}

/** 8월의 벌집 미리보기 — 탭하면 /feed/hive 상세로 이동한다 */
export function HivePreviewCard({ hive }: Props) {
  const router = useRouter()
  const { month, dayLevels, currentStreak } = hive
  const total = dayLevels.length
  const filled = dayLevels.filter((lv) => lv !== null && lv > 0).length
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
    <section className="mx-5 mt-4">
      <button
        type="button"
        onClick={() => router.push('/feed/hive')}
        className="w-full text-left bg-white rounded-[22px] border border-border p-5 active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-black text-ink flex items-center gap-1.5">
            <HiveIcon size={16} />
            {month}월의 벌집
          </h2>
          <span className="flex items-center gap-0.5 text-[11.5px] font-bold text-muted">
            자세히 보기
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
            </svg>
          </span>
        </div>
        <p className="text-[12px] text-muted mt-0.5">
          {filled} / {total}칸 채웠어요
        </p>

        <svg
          viewBox={`0 0 ${vbW.toFixed(1)} ${vbH.toFixed(1)}`}
          width="100%"
          style={{ display: 'block', margin: '12px auto 0' }}
          role="img"
          aria-label={`${total}칸 중 ${filled}칸 채움`}
        >
          {cells.map((c) => {
            const isFilled = c.level !== null && c.level > 0
            return (
              <polygon
                key={c.day}
                transform={`translate(${c.cx.toFixed(2)},${c.cy.toFixed(2)})`}
                points={HEX_POINTS}
                fill={isFilled ? HIVE_FILL : HIVE_EMPTY}
                stroke={isFilled ? HIVE_WALL : HIVE_EMPTY_WALL}
                strokeWidth={1.6}
                strokeLinejoin="round"
              />
            )
          })}
        </svg>

        <p className="mt-2 text-[11px] font-bold text-ink">현재 {currentStreak}일 연속</p>
      </button>
    </section>
  )
}
