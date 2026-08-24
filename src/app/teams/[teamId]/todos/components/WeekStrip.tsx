'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { DAYS_SHORT_KO, addDays, parseDateString, startOfWeekMonday } from '@/lib/dateUtils'
import { dayStatDotClass } from '@/lib/todoStats'
import type { DayStat } from '@/types/todo.types'

interface WeekStripProps {
  selectedDate: string
  todayStr: string
  dayStats: Record<string, DayStat>
  calendarOpen: boolean
  onSelectDate: (date: string) => void
  onToggleCalendar: () => void
}

export function WeekStrip({
  selectedDate,
  todayStr,
  dayStats,
  calendarOpen,
  onSelectDate,
  onToggleCalendar,
}: WeekStripProps) {
  const reduceMotion = useReducedMotion()
  const weekStart = startOfWeekMonday(selectedDate)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const selected = parseDateString(selectedDate)
  const isToday = selectedDate === todayStr
  // 올해가 아니면 '8월'만으로는 어느 해인지 알 수 없다
  const showYear = selected.getFullYear() !== new Date().getFullYear()

  return (
    <div className="px-5 pt-2 pb-1 shrink-0">
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={onToggleCalendar}
          aria-expanded={calendarOpen}
          aria-label="월간 캘린더 열기"
          className="flex items-baseline gap-2 active:scale-[0.98] transition-transform"
        >
          <span className="text-[20px] font-black text-ink tracking-tight">
            {showYear && `${selected.getFullYear()}년 `}
            {selected.getMonth() + 1}월
          </span>
          <svg
            className={`w-3.5 h-3.5 text-muted self-center transition-transform duration-200 ${
              calendarOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.4}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {!isToday && (
          <button
            onClick={() => onSelectDate(todayStr)}
            className="ml-auto text-[12px] font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10 active:scale-95 transition-transform"
          >
            오늘
          </button>
        )}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((date) => {
          const d = parseDateString(date)
          const isSelected = date === selectedDate
          const isTodayCell = date === todayStr
          const stat = dayStats[date]
          const dot = dayStatDotClass(stat, date > todayStr)

          return (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              aria-current={isSelected ? 'date' : undefined}
              aria-label={`${d.getMonth() + 1}월 ${d.getDate()}일${stat ? `, 할 일 ${stat.total}개` : ''}`}
              className="relative flex flex-col items-center gap-1 py-1.5 rounded-[13px]"
            >
              {isSelected && (
                <motion.span
                  layoutId="week-day-pill"
                  className="absolute inset-0 rounded-[13px] bg-primary"
                  transition={
                    reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }
                  }
                />
              )}
              <span
                className={`relative text-[10.5px] font-semibold ${
                  isSelected ? 'text-white/75' : 'text-coolGray-50'
                }`}
              >
                {DAYS_SHORT_KO[d.getDay()]}
              </span>
              <span
                className={`relative text-[14.5px] font-bold tabular-nums ${
                  isSelected
                    ? 'text-white'
                    : isTodayCell
                      ? 'text-primary'
                      : date > todayStr
                        ? 'text-neutral-60'
                        : 'text-ink'
                }`}
              >
                {d.getDate()}
              </span>
              <span
                className={`relative w-[5px] h-[5px] rounded-full ${
                  isSelected ? 'bg-white' : (dot ?? 'bg-transparent')
                }`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
