import type { ReactionType } from '@/types/todo.types'

export type StickerType = ReactionType | 'ANGEL' | 'DEVIL'

export const STICKER_PREFIX = '__sticker__:'
export const STICKER_TYPES: StickerType[] = [
  'LIKE',
  'HEART',
  'SURPRISED',
  'DISLIKE',
  'ANGRY',
  'ANGEL',
  'DEVIL',
]

/** 채팅 스티커 = 우리 꿀벌 캐릭터 일러스트. 기본 이모지 대신 이걸로 통일해서 쓴다.
 *  파일명에 공백이 있으면 URL로 못 쓰니 encodeURI로 감싼다. */
export const STICKER_IMAGE: Record<StickerType, string> = {
  LIKE: '/images/bee/최고꿀벌.png',
  HEART: encodeURI('/images/bee/하트들고있는 꿀벌.png'),
  SURPRISED: '/images/bee/기대하는꿀벌.png',
  DISLIKE: '/images/bee/고민하는꿀벌.png',
  ANGRY: '/images/bee/멍청한꿀벌.png',
  ANGEL: '/images/bee/꽃을달은꿀벌.png',
  DEVIL: '/images/bee/화이팅꿀벌.png',
}

const INLINE_RE = /\[(LIKE|HEART|SURPRISED|DISLIKE|ANGRY|ANGEL|DEVIL)\]/g

export function parseStickerType(content: string): StickerType | null {
  if (!content.startsWith(STICKER_PREFIX)) return null
  const type = content.slice(STICKER_PREFIX.length) as StickerType
  return STICKER_TYPES.includes(type) ? type : null
}

export type MsgPart = { t: 'text'; s: string } | { t: 'emoji'; e: StickerType }

export function parseParts(content: string): MsgPart[] {
  const parts: MsgPart[] = []
  let last = 0
  INLINE_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = INLINE_RE.exec(content)) !== null) {
    if (m.index > last) parts.push({ t: 'text', s: content.slice(last, m.index) })
    parts.push({ t: 'emoji', e: m[1] as StickerType })
    last = m.index + m[0].length
  }
  if (last < content.length) parts.push({ t: 'text', s: content.slice(last) })
  return parts.length ? parts : [{ t: 'text', s: content }]
}

export function parseStandaloneSticker(content: string): StickerType | null {
  const trimmed = content.trim()
  if (trimmed.startsWith(STICKER_PREFIX)) {
    const type = trimmed.slice(STICKER_PREFIX.length).trim()
    return STICKER_TYPES.includes(type as StickerType) ? (type as StickerType) : null
  }
  return STICKER_TYPES.includes(trimmed as StickerType) ? (trimmed as StickerType) : null
}
