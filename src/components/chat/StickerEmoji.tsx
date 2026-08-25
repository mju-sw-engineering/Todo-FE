'use client'

import Image from 'next/image'
import { STICKER_IMAGE } from '@/lib/sticker'
import type { StickerType } from '@/lib/sticker'

/** 채팅 전용 스티커 렌더러 — 기본 이모지 대신 꿀벌 캐릭터 이미지를 쓴다.
 *  할 일 반응(ReactionEmoji)과는 별개라 여기만 바꿔도 다른 화면엔 영향이 없다. */
export function StickerEmoji({ type, size }: { type: StickerType; size: number }) {
  return (
    <span
      className="relative inline-block shrink-0 align-middle"
      style={{ width: size, height: size }}
    >
      <Image src={STICKER_IMAGE[type]} alt="" fill unoptimized className="object-contain" />
    </span>
  )
}
