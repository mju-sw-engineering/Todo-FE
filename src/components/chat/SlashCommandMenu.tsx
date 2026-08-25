'use client'

import { BeeAvatar } from '@/components/ui/BeeAvatar'
import type { CHAT_COMMAND_LIST } from '@/lib/chatCommand'

interface SlashCommandMenuProps {
  commands: typeof CHAT_COMMAND_LIST
  /** 방향키로 움직이는 하이라이트 인덱스 */
  activeIndex: number
  onHover: (index: number) => void
  onSelect: (commandText: string) => void
}

/** "/"로 시작하면 뜨는 명령어 자동완성 — 방향키로 고르고 Enter/탭으로 바로 전송한다 */
export function SlashCommandMenu({
  commands,
  activeIndex,
  onHover,
  onSelect,
}: SlashCommandMenuProps) {
  if (commands.length === 0) return null

  return (
    <div className="mb-2 flex flex-col gap-1 rounded-2xl border border-border bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
      {commands.map((c, i) => {
        const active = i === activeIndex
        return (
          <button
            key={c.command}
            type="button"
            onMouseEnter={() => onHover(i)}
            onClick={() => onSelect(c.text)}
            className={`flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left transition-colors active:scale-[0.99] ${
              active ? 'bg-primary/8' : 'hover:bg-primary/5'
            }`}
          >
            <BeeAvatar size={36} />
            <span className="min-w-0">
              <span className="block text-[13.5px] font-bold text-ink">{c.text}</span>
              <span className="block truncate text-[11.5px] text-muted">{c.description}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
