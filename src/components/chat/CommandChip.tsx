'use client'

import { IoSparkles } from 'react-icons/io5'

interface CommandChipProps {
  label: string
  isMine: boolean
  pending: boolean
  onTap: () => void
}

/** 채팅에 뜬 슬래시 명령어 메시지 — 탭하면 실행 결과를 불러온다 */
export function CommandChip({ label, isMine, pending, onTap }: CommandChipProps) {
  return (
    <button
      type="button"
      onClick={onTap}
      disabled={pending}
      className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-[13.5px] font-bold transition-transform active:scale-95 disabled:opacity-60 ${
        isMine
          ? 'bg-primary text-white rounded-br-sm'
          : 'bg-primary-light text-primary rounded-bl-sm'
      }`}
    >
      <IoSparkles size={14} className="shrink-0" />
      {label}
      <span className={`text-[11px] font-semibold ${isMine ? 'text-white/75' : 'text-primary/70'}`}>
        {pending ? '전송 중...' : '결과 보기'}
      </span>
    </button>
  )
}
