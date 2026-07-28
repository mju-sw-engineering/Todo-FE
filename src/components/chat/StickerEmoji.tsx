'use client'

import { ReactionEmoji } from '@/components/ui/ReactionEmoji'
import type { ReactionType } from '@/types/todo.types'
import type { StickerType } from '@/lib/sticker'

export function StickerEmoji({ type, size }: { type: StickerType; size: number }) {
  if (type === 'ANGEL') return <span style={{ fontSize: size * 0.7 }}>😇</span>
  if (type === 'DEVIL') return <span style={{ fontSize: size * 0.7 }}>😈</span>
  return <ReactionEmoji type={type as ReactionType} size={size} />
}
