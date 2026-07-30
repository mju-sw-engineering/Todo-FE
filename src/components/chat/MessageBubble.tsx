'use client'

import { StickerEmoji } from '@/components/chat/StickerEmoji'
import { parseStickerType, parseParts } from '@/lib/sticker'

export function MessageBubble({ content, isMine }: { content: string; isMine: boolean }) {
  const stickerType = parseStickerType(content)
  if (stickerType) {
    return (
      <div className="p-1 active:scale-95 transition-transform select-none">
        <StickerEmoji type={stickerType} size={80} />
      </div>
    )
  }

  const parts = parseParts(content)
  const hasEmoji = parts.some((p) => p.t === 'emoji')
  const bubbleBase = `px-3.5 py-2.5 rounded-2xl text-[14px] leading-relaxed ${
    isMine ? 'bg-primary text-white rounded-br-sm' : 'bg-gray-100 text-ink rounded-bl-sm'
  }`

  if (!hasEmoji) {
    return <div className={`${bubbleBase} wrap-break-word`}>{content}</div>
  }

  return (
    <div className={`${bubbleBase} flex flex-wrap items-center gap-x-0.5 gap-y-0.5`}>
      {parts.map((p, i) =>
        p.t === 'text' ? (
          <span key={i} className="wrap-break-word">
            {p.s}
          </span>
        ) : (
          <span key={i} className="inline-flex items-center shrink-0 leading-none">
            <StickerEmoji type={p.e} size={22} />
          </span>
        )
      )}
    </div>
  )
}
