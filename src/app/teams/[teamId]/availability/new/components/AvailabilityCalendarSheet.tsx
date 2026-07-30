'use client'

import { createPortal } from 'react-dom'
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

interface AvailabilityCalendarSheetProps {
  selectedDates: string[]
  onConfirm: (dates: string[]) => void
  onClose: () => void
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

export function AvailabilityCalendarSheet({
  selectedDates,
  onConfirm,
  onClose,
}: AvailabilityCalendarSheetProps) {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [pending, setPending] = useState<string[]>(selectedDates)

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

  function toggleDate(dateStr: string) {
    setPending((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr].sort()
    )
  }

  function confirm() {
    onConfirm(pending)
    onClose()
  }

  return createPortal(
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 320, mass: 0.8 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0, bottom: 0.3 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 80 || info.velocity.y > 400) onClose()
        }}
        className="fixed bottom-0 left-0 right-0 z-50 max-w-97.5 mx-auto bg-white rounded-t-3xl px-5 pt-4 pb-8 cursor-grab active:cursor-grabbing"
      >
        <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5" />
        <h3 className="text-[16px] font-bold text-ink mb-5">가능 날짜 선택</h3>

        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={goPrevMonth}
            disabled={!canGoPrev}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:pointer-events-none"
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
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
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

        <div className="grid grid-cols-7 mb-5">
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} className="h-10" />
            const dateStr = `${year}-${pad(month)}-${pad(day)}`
            const isPast = dateStr < todayStr
            const isToday = dateStr === todayStr
            const isSelected = pending.includes(dateStr)
            const dow = new Date(year, month - 1, day).getDay()

            return (
              <button
                key={dateStr}
                type="button"
                disabled={isPast}
                onClick={() => toggleDate(dateStr)}
                className="flex items-center justify-center h-10 disabled:pointer-events-none"
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

        <button
          type="button"
          onClick={confirm}
          className="w-full py-4 bg-primary text-white text-[15px] font-semibold rounded-[14px] transition-all duration-200 hover:opacity-85"
        >
          {pending.length > 0 ? `${pending.length}일 선택 완료` : '선택 완료'}
        </button>
      </motion.div>
    </>,
    document.body
  )
}
