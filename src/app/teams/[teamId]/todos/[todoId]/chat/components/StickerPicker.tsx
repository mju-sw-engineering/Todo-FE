'use client'

import { StickerEmoji } from '@/components/chat/StickerEmoji'
import { STICKER_TYPES } from '@/lib/sticker'
import type { StickerType } from '@/lib/sticker'

interface StickerPickerProps {
  onSticker: (t: StickerType) => void
  onMini: (t: StickerType) => void
}

export function StickerPicker({ onSticker, onMini }: StickerPickerProps) {
  return (
    <div className="mb-2 bg-gray-50 rounded-2xl px-3 pt-3 pb-2">
      <p className="text-[11px] font-semibold text-muted mb-1.5">큰 스티커</p>
      <div className="flex items-center justify-around mb-3">
        {STICKER_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onSticker(type)}
            className="active:scale-90 transition-transform"
            aria-label={type}
          >
            <StickerEmoji type={type} size={46} />
          </button>
        ))}
      </div>

      <div className="border-t border-border mb-2" />

      <p className="text-[11px] font-semibold text-muted mb-1.5">
        미니티콘 <span className="font-normal opacity-60">텍스트에 추가</span>
      </p>
      <div className="flex items-center justify-around pb-1">
        {STICKER_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onMini(type)}
            className="active:scale-90 transition-transform"
            aria-label={type}
          >
            <StickerEmoji type={type} size={30} />
          </button>
        ))}
      </div>
    </div>
  )
}
