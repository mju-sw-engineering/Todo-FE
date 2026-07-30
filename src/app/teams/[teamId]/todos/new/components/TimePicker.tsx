'use client'

import { createPortal } from 'react-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

interface TimePickerProps {
  value: string
  onChange: (v: string) => void
  onClose: () => void
}

export function TimePicker({ value, onChange, onClose }: TimePickerProps) {
  const now = new Date()
  const nowH = now.getHours()
  const nowM = now.getMinutes()

  function defaultTime() {
    const nextM = Math.ceil((nowM + 5) / 5) * 5
    if (nextM >= 60) {
      const h = nowH + 1 >= 24 ? 23 : nowH + 1
      return { h, m: 0 }
    }
    return { h: nowH, m: nextM }
  }

  const init = value
    ? { h: Number(value.split(':')[0]), m: Number(value.split(':')[1]) }
    : defaultTime()

  const [ampm, setAmpm] = useState<'AM' | 'PM'>(init.h >= 12 ? 'PM' : 'AM')
  const [hour, setHour] = useState(init.h % 12 || 12)
  const [minute, setMinute] = useState(
    MINUTES.includes(init.m) ? init.m : (MINUTES.find((m) => m >= init.m) ?? 0)
  )

  function get24H(h: number, ap: 'AM' | 'PM') {
    return (h % 12) + (ap === 'PM' ? 12 : 0)
  }

  function isHourDisabled(h: number, ap: 'AM' | 'PM') {
    return get24H(h, ap) * 60 + 55 <= nowH * 60 + nowM
  }

  function isMinuteDisabled(m: number) {
    return get24H(hour, ampm) * 60 + m <= nowH * 60 + nowM
  }

  function handleAmpm(ap: 'AM' | 'PM') {
    setAmpm(ap)
    const newH24 = get24H(hour, ap)
    const hasValidMinute = MINUTES.some((m) => newH24 * 60 + m > nowH * 60 + nowM)
    if (!hasValidMinute) {
      const validHour = HOURS.find((h) => !isHourDisabled(h, ap))
      if (validHour) {
        setHour(validHour)
        const firstValidMin =
          MINUTES.find((m) => get24H(validHour, ap) * 60 + m > nowH * 60 + nowM) ?? 0
        setMinute(firstValidMin)
      }
    } else {
      const firstValidMin = MINUTES.find((m) => newH24 * 60 + m > nowH * 60 + nowM)
      if (firstValidMin !== undefined && isMinuteDisabled(minute)) setMinute(firstValidMin)
    }
  }

  function handleHour(h: number) {
    setHour(h)
    const h24 = get24H(h, ampm)
    const firstValidMin = MINUTES.find((m) => h24 * 60 + m > nowH * 60 + nowM)
    if (firstValidMin !== undefined && h24 * 60 + minute <= nowH * 60 + nowM) {
      setMinute(firstValidMin)
    }
  }

  function confirm() {
    const h = get24H(hour, ampm)
    if (h * 60 + minute <= nowH * 60 + nowM) return
    onChange(`${h.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
    onClose()
  }

  const confirmDisabled = get24H(hour, ampm) * 60 + minute <= nowH * 60 + nowM

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
        <h3 className="text-[16px] font-bold text-ink mb-5">마감 시간 선택</h3>

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
            const disabled = isHourDisabled(h, ampm)
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
            const disabled = isMinuteDisabled(m)
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
