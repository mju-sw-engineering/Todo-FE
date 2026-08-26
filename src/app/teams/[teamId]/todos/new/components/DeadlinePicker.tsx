'use client'

import { createPortal } from 'react-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar } from '@/components/ui/Calendar'
import { pad } from '@/lib/dateUtils'

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

interface DeadlinePickerProps {
  value: Date | null
  maxDate?: Date | null
  onChange: (date: Date) => void
  onClose: () => void
}

/** 마감 날짜·시간 선택 — 날짜는 실제 달력에서 몇 달이든 앞으로 골라 마감 범위를 넉넉히 잡을 수 있다 */
export function DeadlinePicker({ value, maxDate, onChange, onClose }: DeadlinePickerProps) {
  const now = new Date()
  const initial = value ?? now

  const [selectedDateStr, setSelectedDateStr] = useState(toDateStr(initial))
  const [calYear, setCalYear] = useState(initial.getFullYear())
  const [calMonth, setCalMonth] = useState(initial.getMonth() + 1)
  const [ampm, setAmpm] = useState<'AM' | 'PM'>(initial.getHours() >= 12 ? 'PM' : 'AM')
  const [hour, setHour] = useState(initial.getHours() % 12 || 12)
  const [minute, setMinute] = useState(
    MINUTES.includes(initial.getMinutes())
      ? initial.getMinutes()
      : (MINUTES.find((m) => m >= initial.getMinutes()) ?? 0)
  )

  const maxDateStr = maxDate ? toDateStr(maxDate) : undefined

  function get24H(h: number, ap: 'AM' | 'PM'): number {
    return (h % 12) + (ap === 'PM' ? 12 : 0)
  }

  function buildDate(dateStr: string, h24: number, m: number): Date {
    const [y, mo, d] = dateStr.split('-').map(Number)
    return new Date(y, mo - 1, d, h24, m, 0, 0)
  }

  function isDisabled(dateStr: string, h24: number, m: number): boolean {
    const candidate = buildDate(dateStr, h24, m).getTime()
    if (candidate <= now.getTime()) return true
    if (maxDate && candidate > maxDate.getTime()) return true
    return false
  }

  function handleSelectDate(dateStr: string) {
    setSelectedDateStr(dateStr)
    if (isDisabled(dateStr, get24H(hour, ampm), minute)) {
      const fallback = [
        ...HOURS.flatMap((h) => [
          { h, ap: 'AM' as const },
          { h, ap: 'PM' as const },
        ]),
      ].find(({ h, ap }) => !isDisabled(dateStr, get24H(h, ap), minute))
      if (fallback) {
        setHour(fallback.h)
        setAmpm(fallback.ap)
      }
    }
  }

  function handleAmpm(ap: 'AM' | 'PM') {
    setAmpm(ap)
    if (isDisabled(selectedDateStr, get24H(hour, ap), minute)) {
      const validHour = HOURS.find((h) => !isDisabled(selectedDateStr, get24H(h, ap), minute))
      if (validHour) setHour(validHour)
    }
  }

  function handleHour(h: number) {
    setHour(h)
    if (isDisabled(selectedDateStr, get24H(h, ampm), minute)) {
      const validMinute = MINUTES.find((m) => !isDisabled(selectedDateStr, get24H(h, ampm), m))
      if (validMinute !== undefined) setMinute(validMinute)
    }
  }

  function handlePrevMonth() {
    if (calMonth === 1) {
      setCalYear((y) => y - 1)
      setCalMonth(12)
    } else {
      setCalMonth((m) => m - 1)
    }
  }

  function handleNextMonth() {
    if (calMonth === 12) {
      setCalYear((y) => y + 1)
      setCalMonth(1)
    } else {
      setCalMonth((m) => m + 1)
    }
  }

  function confirm() {
    const h24 = get24H(hour, ampm)
    if (isDisabled(selectedDateStr, h24, minute)) return
    onChange(buildDate(selectedDateStr, h24, minute))
    onClose()
  }

  const confirmDisabled = isDisabled(selectedDateStr, get24H(hour, ampm), minute)

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
        className="fixed bottom-0 left-0 right-0 z-50 max-w-97.5 mx-auto flex max-h-[85vh] flex-col rounded-t-3xl bg-white pt-4 cursor-grab active:cursor-grabbing"
      >
        <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5 shrink-0" />

        <div className="overflow-y-auto px-5">
          <h3 className="text-[16px] font-bold text-ink mb-4">마감 날짜·시간 선택</h3>

          <div className="mb-5">
            <Calendar
              selectedDate={selectedDateStr}
              year={calYear}
              month={calMonth}
              dayStats={{}}
              allowFuture
              maxDateStr={maxDateStr}
              onSelectDate={handleSelectDate}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
            />
          </div>

          <div className="flex bg-surface rounded-[14px] p-1 mb-5">
            {(['AM', 'PM'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleAmpm(p)}
                className={`flex-1 py-2.5 rounded-[11px] text-[14px] font-semibold transition-all duration-200 ${
                  ampm === p ? 'bg-white text-ink shadow-sm' : 'text-muted'
                }`}
              >
                {p === 'AM' ? '오전' : '오후'}
              </button>
            ))}
          </div>

          <p className="text-[11px] font-semibold text-muted tracking-wider mb-2">시</p>
          <div className="grid grid-cols-6 gap-1.5 mb-5">
            {HOURS.map((h) => {
              const disabled = isDisabled(selectedDateStr, get24H(h, ampm), minute)
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => !disabled && handleHour(h)}
                  disabled={disabled}
                  className={`py-2.5 rounded-[10px] text-[14px] font-semibold transition-all duration-150 ${
                    hour === h && !disabled
                      ? 'bg-primary text-white'
                      : disabled
                        ? 'bg-surface text-muted/40 cursor-not-allowed line-through'
                        : 'bg-surface text-ink hover:bg-gray-100'
                  }`}
                >
                  {h}
                </button>
              )
            })}
          </div>

          <p className="text-[11px] font-semibold text-muted tracking-wider mb-2">분</p>
          <div className="grid grid-cols-6 gap-1.5 mb-6">
            {MINUTES.map((m) => {
              const disabled = isDisabled(selectedDateStr, get24H(hour, ampm), m)
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => !disabled && setMinute(m)}
                  disabled={disabled}
                  className={`py-2.5 rounded-[10px] text-[14px] font-semibold transition-all duration-150 ${
                    minute === m && !disabled
                      ? 'bg-primary text-white'
                      : disabled
                        ? 'bg-surface text-muted/40 cursor-not-allowed line-through'
                        : 'bg-surface text-ink hover:bg-gray-100'
                  }`}
                >
                  {m.toString().padStart(2, '0')}
                </button>
              )
            })}
          </div>
        </div>

        <div className="shrink-0 px-5 pt-3 pb-9">
          <button
            type="button"
            onClick={confirm}
            disabled={confirmDisabled}
            className="w-full py-4 bg-primary text-white text-[15px] font-semibold rounded-[14px] transition-all duration-200 hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            확인
          </button>
        </div>
      </motion.div>
    </>,
    document.body
  )
}
