'use client'

import { BeeAvatar } from '@/components/ui/BeeAvatar'

interface CommandChipProps {
  label: string
  isMine: boolean
  pending: boolean
}

/** 채팅에 보낸 슬래시 명령어 메시지 — 결과는 바로 아래 비니의 답장으로 자동으로 뜬다 */
export function CommandChip({ label, isMine, pending }: CommandChipProps) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-2xl px-3.5 py-2.5 text-[13.5px] font-bold ${
        isMine
          ? 'rounded-br-sm bg-primary text-white'
          : 'rounded-bl-sm bg-primary-light text-primary'
      }`}
    >
      <BeeAvatar size={18} className={isMine ? 'bg-white/25' : ''} />
      {label}
      {pending && (
        <span
          className={`text-[11px] font-semibold ${isMine ? 'text-white/75' : 'text-primary/70'}`}
        >
          전송 중...
        </span>
      )}
    </div>
  )
}
