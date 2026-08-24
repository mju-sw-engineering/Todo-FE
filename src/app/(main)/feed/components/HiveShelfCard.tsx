import { HiveIcon } from '@/components/ui/HiveIcon'
import type { HiveArchiveMonth, MonthlyHive } from '@/types/feed.types'

interface Props {
  months: HiveArchiveMonth[]
  current: MonthlyHive
}

/** 벌집 보관함 — 다 채운 달의 벌집이 수집된다 (미완주 달은 회색) */
export function HiveShelfCard({ months, current }: Props) {
  const currentFilled = current.dayLevels.filter((lv) => lv !== null && lv > 0).length
  const completeCount = months.filter((m) => m.filledDays >= m.totalDays).length

  return (
    <section className="mx-5 mt-4 bg-white rounded-[24px] border border-border p-5">
      <div className="flex items-start justify-between">
        <h2 className="text-[16px] font-black text-ink tracking-[-0.2px] flex items-center gap-1.5">
          <HiveIcon size={16} />
          벌집 보관함
        </h2>
        <span className="shrink-0 text-[12px] font-bold text-ink">완주 {completeCount}번</span>
      </div>
      <p className="text-[12px] text-muted mt-0.5">다 채운 달의 벌집이 여기 쌓여요</p>

      <div className="flex gap-2 mt-4">
        {months.map((m) => {
          const complete = m.filledDays >= m.totalDays
          return (
            <div
              key={`${m.year}-${m.month}`}
              className="flex-1 flex flex-col items-center gap-1 bg-surface rounded-xl py-3"
            >
              <HiveIcon size={40} muted={!complete} />
              <span className="text-[11px] font-extrabold text-ink">{m.month}월</span>
              <span className="text-[10px] font-medium text-muted">
                {m.filledDays}/{m.totalDays}
              </span>
            </div>
          )
        })}
        <div
          className="flex-1 flex flex-col items-center gap-1 bg-white rounded-xl py-3"
          style={{ outline: '1.5px dashed #ffe042', outlineOffset: -1.5 }}
        >
          <HiveIcon size={40} />
          <span className="text-[11px] font-extrabold text-ink">{current.month}월</span>
          <span className="text-[10px] font-medium text-muted">
            {currentFilled}/{current.dayLevels.length} · 진행 중
          </span>
        </div>
      </div>
    </section>
  )
}
