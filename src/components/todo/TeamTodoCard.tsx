'use client'

import { ConvexCard } from '@/components/ui/ConvexCard'
import { TodoStatusBadge } from '@/components/ui/TodoStatusBadge'
import { CARD_PALETTES } from '@/lib/cardPalettes'
import { parseAchievementCount } from '@/lib/formatters'
import { formatISOTime } from '@/lib/dateUtils'
import type { Todo } from '@/types/todo.types'

interface TeamTodoCardProps {
  todo: Todo
  colorIndex: number
  onClick: () => void
}

export function TeamTodoCard({ todo, colorIndex, onClick }: TeamTodoCardProps) {
  const { achieved, total } = parseAchievementCount(todo.achievementCount)
  const percentage = total > 0 ? Math.round((achieved / total) * 100) : 0
  const myStatus = todo.myStatus
  const palette = CARD_PALETTES[colorIndex % CARD_PALETTES.length]
  const time = formatISOTime(todo.deadline)
  const isDone = myStatus === '완료' || todo.status === 'FAIL'

  return (
    <ConvexCard
      bg={palette.bg}
      className={`cursor-pointer active:scale-[0.99] ${isDone ? 'opacity-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <TodoStatusBadge status={todo.status} />
          {myStatus && (
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
              style={{ background: myStatus === '완료' ? palette.accent : 'rgba(0,0,0,0.18)' }}
            >
              {myStatus === '완료' ? '완료' : '미완료'}
            </span>
          )}
        </div>
        {time && (
          <span
            className="text-[14px] font-black tracking-tight shrink-0"
            style={{ color: palette.accent }}
          >
            ~{time}
          </span>
        )}
      </div>

      <p className="text-[17px] font-black leading-snug" style={{ color: palette.text }}>
        {todo.title}
      </p>

      <p className="text-[11px] font-semibold -mt-1" style={{ color: palette.text, opacity: 0.5 }}>
        작성: {todo.creatorNickname}
      </p>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold" style={{ color: palette.text, opacity: 0.6 }}>
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
