'use client'

import { createPortal } from 'react-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

interface RangeTimeSheetProps {
  title: string
  value: string
  onChange: (v: string) => void
  onClose: () => void
}

export function RangeTimeSheet({ title, value, onChange, onClose }: RangeTimeSheetProps) {
  const init = value
    ? { h: Number(value.split(':')[0]), m: Number(value.split(':')[1]) }
    : { h: 9, m: 0 }

  const [ampm, setAmpm] = useState<'AM' | 'PM'>(init.h >= 12 ? 'PM' : 'AM')
  const [hour, setHour] = useState(init.h % 12 || 12)
  const [minute, setMinute] = useState(
    MINUTES.includes(init.m) ? init.m : (MINUTES.find((m) => m >= init.m) ?? 0)
  )

  function get24H(h: number, ap: 'AM' | 'PM') {
    return (h % 12) + (ap === 'PM' ? 12 : 0)
  }

  function confirm() {
    const h = get24H(hour, ampm)
    onChange(`${h.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
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
        className="fixed bottom-0 left-0 right-0 z-50 max-w-app mx-auto bg-white rounded-t-3xl px-5 pt-4 pb-10 cursor-grab active:cursor-grabbing"
      >
        <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5" />
        <h3 className="text-[16px] font-bold text-ink mb-5">{title}</h3>

        <div className="flex bg-surface rounded-[14px] p-1 mb-5">
          {(['AM', 'PM'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmpm(p)}
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
          {HOURS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHour(h)}
              className={`py-2.5 rounded-[10px] text-[14px] font-semibold transition-all duration-150 ${
                hour === h ? 'bg-primary text-white' : 'bg-surface text-ink hover:bg-gray-100'
              }`}
            >
              {h}
            </button>
          ))}
        </div>

        <p className="text-[11px] font-semibold text-muted tracking-wider mb-2">분</p>
        <div className="grid grid-cols-6 gap-1.5 mb-6">
          {MINUTES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMinute(m)}
              className={`py-2.5 rounded-[10px] text-[14px] font-semibold transition-all duration-150 ${
                minute === m ? 'bg-primary text-white' : 'bg-surface text-ink hover:bg-gray-100'
              }`}
            >
              {m.toString().padStart(2, '0')}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={confirm}
          className="w-full py-4 bg-primary text-white text-[15px] font-semibold rounded-[14px] transition-all duration-200 hover:opacity-85"
        >
          확인
        </button>
      </motion.div>
    </>,
    document.body
  )
}
