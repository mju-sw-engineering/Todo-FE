'use client'

import { AngelBlob, DevilBlob } from '@/components/ui/BlobCharacter'
import { ReactionEmoji } from '@/components/ui/ReactionEmoji'
import type { ReactionType } from '@/types/todo.types'
import type { StickerType } from '@/lib/sticker'

export function StickerEmoji({ type, size }: { type: StickerType; size: number }) {
  if (type === 'ANGEL') return <AngelBlob size={size} />
  if (type === 'DEVIL') return <DevilBlob size={size} />
  return <ReactionEmoji type={type as ReactionType} size={size} />
}
