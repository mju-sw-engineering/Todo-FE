'use client'

import { useMemo } from 'react'

const LEVEL_CLASSES = [
  'bg-neutral-30',
  'bg-primary/15',
  'bg-primary/35',
  'bg-primary/65',
  'bg-primary',
]
const MONTH_LABELS_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
const CELL = 16
const GAP = 4
const WEEK_COUNT = 26

interface DayCell {
  date: string
  count: number
  isFuture: boolean
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function hashDate(dateStr: string): number {
  let h = 0
  for (let i = 0; i < dateStr.length; i++) h = (Math.imul(31, h) + dateStr.charCodeAt(i)) | 0
  return Math.abs(h)
}

function countForDate(dateStr: string): number {
  const r = hashDate(dateStr) % 100
  if (r < 45) return 0
  if (r < 68) return 1
  if (r < 84) return 2
  if (r < 94) return 3
  return 4
}

export function MyHoneyRecordCalendar() {
  const { columns, monthMarks } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const end = new Date(today)
    end.setDate(end.getDate() + (6 - end.getDay()))
    const start = new Date(end)
    start.setDate(start.getDate() - WEEK_COUNT * 7 + 1)
    start.setDate(start.getDate() - start.getDay())

    const days: DayCell[] = []
    const cursor = new Date(start)
    while (cursor <= end) {
      const dateStr = toDateStr(cursor)
      const isFuture = cursor > today
      days.push({ date: dateStr, count: isFuture ? 0 : countForDate(dateStr), isFuture })
      cursor.setDate(cursor.getDate() + 1)
    }

    const cols: DayCell[][] = []
    for (let i = 0; i < days.length; i += 7) cols.push(days.slice(i, i + 7))

    const marks: { colIndex: number; label: string }[] = []
    let lastMonth = -1
    cols.forEach((col, i) => {
      const month = new Date(col[0].date).getMonth()
      if (month !== lastMonth) {
        marks.push({ colIndex: i, label: MONTH_LABELS_EN[month] })
        lastMonth = month
      }
    })

    return { columns: cols, monthMarks: marks }
  }, [])

  const colPitch = CELL + GAP

  return (
    <div className="overflow-x-auto scrollbar-hidden -mx-1 px-1">
      <div
        className="inline-flex flex-col gap-2 pb-1"
        style={{ minWidth: columns.length * colPitch }}
      >
        <div className="flex" style={{ height: 16 }}>
          {columns.map((_, i) => {
            const mark = monthMarks.find((m) => m.colIndex === i)
            return (
              <div
                key={i}
                style={{ width: colPitch }}
                className="text-[10.5px] text-muted font-semibold shrink-0"
              >
                {mark?.label ?? ''}
              </div>
            )
          })}
        </div>

        <div className="flex" style={{ gap: GAP }}>
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col shrink-0" style={{ gap: GAP }}>
              {col.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date} · ${day.count}건`}
                  className={`rounded-[3px] ${day.isFuture ? '' : LEVEL_CLASSES[Math.min(day.count, 4)]}`}
                  style={{
                    width: CELL,
                    height: CELL,
                    visibility: day.isFuture ? 'hidden' : 'visible',
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-1.5 text-[10.5px] text-muted">
          <span>Less</span>
          {LEVEL_CLASSES.map((cls) => (
            <span key={cls} className={`rounded-[3px] ${cls}`} style={{ width: 13, height: 13 }} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
