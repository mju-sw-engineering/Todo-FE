'use client'

import { useMemo, useState } from 'react'

interface InlineDateCalendarProps {
  selectedDates: string[]
  onToggle: (dateStr: string) => void
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

/** 페이지에 바로 노출되는 다중 선택 캘린더 — 탭 즉시 선택/해제된다 (시트·확인 단계 없음) */
export function InlineDateCalendar({ selectedDates, onToggle }: InlineDateCalendarProps) {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)

  const canGoPrev = year > today.getFullYear() || month > today.getMonth() + 1

  const cells = useMemo(() => {
    const firstDow = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const result: (number | null)[] = Array(firstDow).fill(null)
    for (let d = 1; d <= daysInMonth; d++) result.push(d)
    while (result.length % 7 !== 0) result.push(null)
    return result
  }, [year, month])

  function goPrevMonth() {
    if (!canGoPrev) return
    if (month === 1) {
      setYear((y) => y - 1)
      setMonth(12)
    } else {
      setMonth((m) => m - 1)
    }
  }

  function goNextMonth() {
    if (month === 12) {
      setYear((y) => y + 1)
      setMonth(1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  return (
    <div className="rounded-[18px] border-[1.5px] border-border px-3 pt-2 pb-3">
      <div className="flex items-center justify-between mb-1 px-1">
        <button
          type="button"
          onClick={goPrevMonth}
          disabled={!canGoPrev}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:pointer-events-none"
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
        <span className="text-[14px] font-bold text-ink">
          {year}년 {MONTH_KO[month - 1]}
        </span>
        <button
          type="button"
          onClick={goNextMonth}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
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
        {DAY_KO.map((d, i) => (
          <div
            key={d}
            className={`text-center text-[11px] font-semibold py-1 ${i === 0 ? 'text-status-red' : i === 6 ? 'text-primary' : 'text-muted'}`}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="h-9.5" />
          const dateStr = `${year}-${pad(month)}-${pad(day)}`
          const isPast = dateStr < todayStr
          const isToday = dateStr === todayStr
          const isSelected = selectedDates.includes(dateStr)
          const dow = new Date(year, month - 1, day).getDay()

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isPast}
              onClick={() => onToggle(dateStr)}
              aria-pressed={isSelected}
              className="flex items-center justify-center h-9.5 disabled:pointer-events-none"
            >
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-semibold transition-colors ${
                  isSelected
                    ? 'bg-primary text-white'
                    : isPast
                      ? 'text-gray-300'
                      : isToday
                        ? 'ring-1 ring-primary text-primary'
                        : dow === 0
                          ? 'text-status-red hover:bg-gray-100'
                          : dow === 6
                            ? 'text-primary hover:bg-gray-100'
                            : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {day}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
