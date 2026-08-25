'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { StickerEmoji } from '@/components/chat/StickerEmoji'
import { STICKER_TYPES } from '@/lib/sticker'
import type { StickerType } from '@/lib/sticker'

interface StickerPickerProps {
  onSticker: (t: StickerType) => void
  onMini: (t: StickerType) => void
}

type Tab = 'sticker' | 'mini'

const TAB_ORDER: Tab[] = ['sticker', 'mini']

/** 카카오톡 이모티콘 창처럼 탭으로 종류를 전환해 한 그리드만 보여준다 —
 *  큰 스티커·미니티콘을 한 번에 다 늘어놓지 않고, 탭을 바꾸면 좌우로 슬라이드한다. */
export function StickerPicker({ onSticker, onMini }: StickerPickerProps) {
  const [tab, setTab] = useState<Tab>('sticker')
  const [direction, setDirection] = useState(1)
  const reduceMotion = useReducedMotion()
  const slideX = reduceMotion ? 0 : 28

  function selectTab(next: Tab) {
    if (next === tab) return
    setDirection(TAB_ORDER.indexOf(next) > TAB_ORDER.indexOf(tab) ? 1 : -1)
    setTab(next)
  }

  return (
    <div className="mb-2 overflow-hidden rounded-2xl bg-gray-50 p-2.5">
      <div className="mb-2.5 grid grid-cols-2 gap-1 rounded-full bg-neutral-30 p-1">
        {(
          [
            { key: 'sticker', label: '큰 스티커' },
            { key: 'mini', label: '미니티콘' },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => selectTab(key)}
            className="relative py-1.5 text-[12.5px] font-bold transition-colors"
          >
            {tab === key && (
              <motion.span
                layoutId="sticker-picker-tab"
                className="absolute inset-0 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
                transition={
                  reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }
                }
              />
            )}
            <span className={`relative ${tab === key ? 'text-ink' : 'text-muted'}`}>{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: direction * slideX }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -slideX }}
          transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="grid grid-cols-4 gap-1.5 px-1 pb-1"
        >
          {STICKER_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => (tab === 'sticker' ? onSticker(type) : onMini(type))}
              className="flex items-center justify-center rounded-[14px] py-2 transition-transform active:scale-90 hover:bg-white"
              aria-label={type}
            >
              <StickerEmoji type={type} size={tab === 'sticker' ? 44 : 30} />
            </button>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
