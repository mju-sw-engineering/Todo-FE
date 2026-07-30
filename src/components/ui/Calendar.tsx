'use client'

import { useMemo } from 'react'

interface CalendarProps {
  selectedDate: string
  year: number
  month: number
  dailyCounts: Record<string, number>
  onSelectDate: (date: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}

const MONTH_KO = [
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
  '12월',
]
const DAY_KO = ['일', '월', '화', '수', '목', '금', '토']

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function Calendar({
  selectedDate,
  year,
  month,
  dailyCounts,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: CalendarProps) {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
  const currentYM = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`
  const viewYM = `${year}-${pad(month)}`
  const canGoNext = viewYM < currentYM

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
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onPrevMonth}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
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
          {year}년 {MONTH_KO[month - 1]}
        </span>
        <button
          onClick={onNextMonth}
          disabled={!canGoNext}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:pointer-events-none"
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

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-0.5">
        {DAY_KO.map((d, i) => (
          <div
            key={d}
            className={`text-center text-[10px] font-semibold py-0.5 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-muted'}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="h-9" />
          const dateStr = `${year}-${pad(month)}-${pad(day)}`
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate
          const isFuture = dateStr > todayStr
          const count = dailyCounts[dateStr] ?? 0
          const dow = new Date(year, month - 1, day).getDay()

          return (
            <button
              key={dateStr}
              disabled={isFuture}
              onClick={() => onSelectDate(dateStr)}
              className="flex flex-col items-center justify-start py-0.5 gap-0 disabled:pointer-events-none"
            >
              <div
                className={`w-6 h-6 flex items-center justify-center rounded-full text-[12px] font-semibold transition-colors
                  ${
                    isSelected
                      ? 'bg-primary text-white'
                      : isToday
                        ? 'ring-1 ring-gray-400 text-gray-900'
                        : isFuture
                          ? 'text-gray-300'
                          : dow === 0
                            ? 'text-red-400 hover:bg-gray-100'
                            : dow === 6
                              ? 'text-blue-400 hover:bg-gray-100'
                              : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {day}
              </div>
              <div className="h-3 flex items-center justify-center">
                {count > 0 && (
                  <span
                    className={`text-[8px] font-black leading-none tabular-nums ${
                      isSelected ? 'text-white/70' : isFuture ? 'text-gray-200' : 'text-gray-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
