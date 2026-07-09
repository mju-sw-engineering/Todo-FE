'use client'

import Image from 'next/image'
import { BlobAvatar } from '@/components/ui/BlobAvatar'
import { ConvexCard } from '@/components/ui/ConvexCard'
import { TodoStatusBadge } from '@/components/ui/TodoStatusBadge'
import { CARD_PALETTES } from '@/lib/cardPalettes'
import { parseAchievementCount } from '@/lib/formatters'
import { formatISOTime } from '@/lib/dateUtils'
import type { Todo } from '@/types/todo.types'

export interface TodoWithTeam extends Todo {
  teamId: number
  teamName: string
  teamImageUrl: string | null
}

interface MyTodoCardProps {
  todo: TodoWithTeam
  colorIndex: number
  onClick: () => void
}

export function MyTodoCard({ todo, colorIndex, onClick }: MyTodoCardProps) {
  const { achieved, total } = parseAchievementCount(todo.achievementCount)
  const percentage = total > 0 ? Math.round((achieved / total) * 100) : 0
  const myStatus = todo.myStatus
  const palette = CARD_PALETTES[colorIndex % CARD_PALETTES.length]
  const time = formatISOTime(todo.deadline)
  const dimmed = myStatus === '완료' || todo.status === 'FAIL'

  return (
    <ConvexCard
      bg={palette.bg}
      className={`cursor-pointer active:scale-[0.99] ${dimmed ? 'opacity-50' : ''}`}
      onClick={onClick}
      shadow={false}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <span
            className="flex items-center gap-1.5 text-[11px] font-bold pl-1 pr-2.5 py-1 rounded-full truncate max-w-40"
            style={{ background: palette.badge, color: palette.text }}
          >
            {todo.teamImageUrl ? (
              <span className="w-4 h-4 rounded-full overflow-hidden shrink-0 inline-block relative">
                <Image
                  src={todo.teamImageUrl}
                  alt={todo.teamName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </span>
            ) : (
              <span className="shrink-0 inline-block">
                <BlobAvatar seed={todo.teamName} size={16} />
              </span>
            )}
            {todo.teamName}
          </span>
          <TodoStatusBadge status={todo.status} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {myStatus === '완료' && (
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
              style={{ background: palette.accent }}
            >
              완료
            </span>
          )}
          {time && (
            <span
              className="text-[13px] font-black tracking-tight"
              style={{ color: palette.accent }}
            >
              ~{time}
            </span>
          )}
        </div>
      </div>

      <p className="text-[17px] font-black leading-snug" style={{ color: palette.text }}>
        {todo.title}
      </p>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span
            className="text-[11px] font-semibold"
            style={{ color: palette.text, opacity: 0.65 }}
          >
            {achieved}/{total} 인증
          </span>
          <span className="text-[12px] font-black" style={{ color: palette.accent }}>
            {percentage}%
          </span>
        </div>
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.5)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%`, background: palette.accent }}
          />
        </div>
      </div>
    </ConvexCard>
  )
}
