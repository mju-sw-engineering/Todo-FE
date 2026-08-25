'use client'

import { useMemo } from 'react'
import { MONTHS_KO, DAYS_SHORT_KO, pad, todayString } from '@/lib/dateUtils'
import { dayStatDotClass } from '@/lib/todoStats'
import type { DayStat } from '@/types/todo.types'

interface CalendarProps {
  selectedDate: string
  year: number
  month: number
  dayStats: Record<string, DayStat>
  /** 마감이 미래인 할 일도 보여주는 화면이라면 앞으로의 날짜도 고를 수 있어야 한다 */
  allowFuture?: boolean
  onSelectDate: (date: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}

export function Calendar({
  selectedDate,
  year,
  month,
  dayStats,
  allowFuture = false,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: CalendarProps) {
  const todayStr = todayString()
  const currentYM = todayStr.slice(0, 7)
  const viewYM = `${year}-${pad(month)}`
  const canGoNext = allowFuture || viewYM < currentYM

  const cells = useMemo(() => {
    const firstDow = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const result: (number | null)[] = Array(firstDow).fill(null)
    for (let d = 1; d <= daysInMonth; d++) result.push(d)
    while (result.length % 7 !== 0) result.push(null)
    return result
  }, [year, month])

  return (
    <div className="bg-white rounded-[18px] border border-border px-3 pt-2.5 pb-2">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onPrevMonth}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-neutral-30 transition-colors"
          aria-label="이전 달"
        >
          <svg
            className="w-3.5 h-3.5 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-[13px] font-bold text-ink">
          {year}년 {MONTHS_KO[month - 1]}
        </span>
        <button
          onClick={onNextMonth}
          disabled={!canGoNext}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-neutral-30 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          aria-label="다음 달"
        >
          <svg
            className="w-3.5 h-3.5 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 mb-0.5">
        {DAYS_SHORT_KO.map((d, i) => (
          <div
            key={d}
            className={`text-center text-[10px] font-semibold py-0.5 ${
              i === 0 ? 'text-status-red' : i === 6 ? 'text-primary' : 'text-muted'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="h-9" />
          const dateStr = `${year}-${pad(month)}-${pad(day)}`
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate
          const isFuture = dateStr > todayStr
          const stat = dayStats[dateStr]
          const dot = dayStatDotClass(stat, isFuture)
          const dow = new Date(year, month - 1, day).getDay()

          return (
            <button
              key={dateStr}
              disabled={!allowFuture && isFuture}
              onClick={() => onSelectDate(dateStr)}
              aria-current={isSelected ? 'date' : undefined}
              aria-label={`${month}월 ${day}일${stat ? `, 할 일 ${stat.total}개` : ''}`}
              className="flex flex-col items-center justify-start py-0.5 gap-0 disabled:pointer-events-none"
            >
              <div
                className={`w-6 h-6 flex items-center justify-center rounded-full text-[12px] font-semibold transition-colors
                  ${
                    isSelected
                      ? 'border-2 border-primary text-primary'
                      : isToday
                        ? 'ring-1 ring-primary text-primary'
                        : isFuture
                          ? 'text-neutral-60 hover:bg-neutral-30'
                          : dow === 0
                            ? 'text-status-red hover:bg-neutral-30'
                            : dow === 6
                              ? 'text-primary hover:bg-neutral-30'
                              : 'text-neutral-100 hover:bg-neutral-30'
                  }`}
              >
                {day}
              </div>
              <div className="h-3 flex items-center justify-center">
                <span
                  className={`w-[5px] h-[5px] rounded-full ${
                    isSelected ? 'bg-primary' : (dot ?? 'bg-transparent')
                  }`}
                />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
