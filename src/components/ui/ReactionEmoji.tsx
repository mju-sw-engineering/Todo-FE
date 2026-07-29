import type { ReactionType } from '@/types/todo.types'

interface ReactionEmojiProps {
  type: ReactionType
  size?: number
}

const EMOJI_MAP: Record<ReactionType, string> = {
  LIKE: '👍',
  HEART: '❤️',
  SURPRISED: '😲',
  DISLIKE: '👎',
  ANGRY: '😠',
}

export function ReactionEmoji({ type, size = 28 }: ReactionEmojiProps) {
  const emoji = EMOJI_MAP[type] ?? type
  return (
    <span className="leading-none" style={{ fontSize: size * 0.7 }}>
      {emoji}
    </span>
  )
}

export function getReactionLabel(type: ReactionType): string {
  const labels: Record<ReactionType, string> = {
    LIKE: '좋아요',
    HEART: '하트',
    SURPRISED: '놀람',
    DISLIKE: '별로',
    ANGRY: '화남',
  }
  return labels[type] ?? type
}
