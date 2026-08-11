'use client'

import { createPortal } from 'react-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { DAYS_KO } from '@/lib/dateUtils'

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
const DAY_OPTION_COUNT = 7

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function buildDayOptions(): Date[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Array.from({ length: DAY_OPTION_COUNT }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    return d
  })
}

function dayShortLabel(d: Date, index: number): string {
  if (index === 0) return '오늘'
  if (index === 1) return '내일'
  return DAYS_KO[d.getDay()].charAt(0)
}

interface DeadlinePickerProps {
  value: Date | null
  maxDate?: Date | null
  onChange: (date: Date) => void
  onClose: () => void
}

export function DeadlinePicker({ value, maxDate, onChange, onClose }: DeadlinePickerProps) {
  const now = new Date()
  const dayOptions = buildDayOptions()

  const initial = value ?? dayOptions[0]
  const initialDayIndex = Math.max(
    0,
    dayOptions.findIndex((d) => isSameDay(d, initial))
  )

  const [dayIndex, setDayIndex] = useState(initialDayIndex)
  const [ampm, setAmpm] = useState<'AM' | 'PM'>(initial.getHours() >= 12 ? 'PM' : 'AM')
  const [hour, setHour] = useState(initial.getHours() % 12 || 12)
  const [minute, setMinute] = useState(
    MINUTES.includes(initial.getMinutes())
      ? initial.getMinutes()
      : (MINUTES.find((m) => m >= initial.getMinutes()) ?? 0)
  )

  function get24H(h: number, ap: 'AM' | 'PM'): number {
    return (h % 12) + (ap === 'PM' ? 12 : 0)
  }

  function buildDate(dIdx: number, h24: number, m: number): Date {
    const d = new Date(dayOptions[dIdx])
    d.setHours(h24, m, 0, 0)
    return d
  }

  function isDisabled(dIdx: number, h24: number, m: number): boolean {
    const candidate = buildDate(dIdx, h24, m).getTime()
    if (candidate <= now.getTime()) return true
    if (maxDate && candidate > maxDate.getTime()) return true
    return false
  }

  function isDayFullyDisabled(dIdx: number): boolean {
    return HOURS.every((h) =>
      MINUTES.every(
        (m) => isDisabled(dIdx, get24H(h, 'AM'), m) && isDisabled(dIdx, get24H(h, 'PM'), m)
      )
    )
  }

  function handleDay(dIdx: number) {
    if (isDayFullyDisabled(dIdx)) return
    setDayIndex(dIdx)
    if (isDisabled(dIdx, get24H(hour, ampm), minute)) {
      const fallback = [
        ...HOURS.flatMap((h) => [
          { h, ap: 'AM' as const },
          { h, ap: 'PM' as const },
        ]),
      ].find(({ h, ap }) => !isDisabled(dIdx, get24H(h, ap), minute))
      if (fallback) {
        setHour(fallback.h)
        setAmpm(fallback.ap)
      }
    }
  }

  function handleAmpm(ap: 'AM' | 'PM') {
    setAmpm(ap)
    if (isDisabled(dayIndex, get24H(hour, ap), minute)) {
      const validHour = HOURS.find((h) => !isDisabled(dayIndex, get24H(h, ap), minute))
      if (validHour) setHour(validHour)
    }
  }

  function handleHour(h: number) {
    setHour(h)
    if (isDisabled(dayIndex, get24H(h, ampm), minute)) {
      const validMinute = MINUTES.find((m) => !isDisabled(dayIndex, get24H(h, ampm), m))
      if (validMinute !== undefined) setMinute(validMinute)
    }
  }

  function confirm() {
    const h24 = get24H(hour, ampm)
    if (isDisabled(dayIndex, h24, minute)) return
    onChange(buildDate(dayIndex, h24, minute))
    onClose()
  }

  const confirmDisabled = isDisabled(dayIndex, get24H(hour, ampm), minute)

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
        className="fixed bottom-0 left-0 right-0 z-50 max-w-97.5 mx-auto bg-white rounded-t-3xl px-5 pt-4 pb-10 cursor-grab active:cursor-grabbing"
      >
        <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5" />
        <h3 className="text-[16px] font-bold text-ink mb-5">마감 날짜·시간 선택</h3>

        <div className="grid grid-cols-7 gap-1.5 mb-5">
          {dayOptions.map((d, i) => {
            const disabled = isDayFullyDisabled(i)
            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => !disabled && handleDay(i)}
                disabled={disabled}
                className={`flex flex-col items-center gap-0.5 py-2 rounded-[10px] text-[12px] font-semibold transition-all duration-150 ${
                  dayIndex === i && !disabled
                    ? 'bg-primary text-white'
                    : disabled
                      ? 'bg-surface text-muted/40 cursor-not-allowed'
                      : 'bg-surface text-ink hover:bg-gray-100'
                }`}
              >
                <span>{dayShortLabel(d, i)}</span>
                <span className="text-[10px] opacity-70">
                  {d.getMonth() + 1}/{d.getDate()}
                </span>
              </button>
            )
          })}
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
            const disabled = isDisabled(dayIndex, get24H(h, ampm), minute)
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
            const disabled = isDisabled(dayIndex, get24H(hour, ampm), m)
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

        <button
          type="button"
          onClick={confirm}
          disabled={confirmDisabled}
          className="w-full py-4 bg-primary text-white text-[15px] font-semibold rounded-[14px] transition-all duration-200 hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          확인
        </button>
      </motion.div>
    </>,
    document.body
  )
}
