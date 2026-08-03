'use client'

import { ConvexCard } from '@/components/ui/ConvexCard'
import { TodoStatusBadge } from '@/components/ui/TodoStatusBadge'
import { CARD_PALETTES } from '@/lib/cardPalettes'
import { parseAchievementCount } from '@/lib/formatters'
import { formatISOTime } from '@/lib/dateUtils'
import { isMyWorkComplete, type Todo } from '@/types/todo.types'

interface TeamTodoCardProps {
  todo: Todo
  colorIndex: number
  onClick: () => void
}

export function TeamTodoCard({ todo, colorIndex, onClick }: TeamTodoCardProps) {
  const { achieved, total } = parseAchievementCount(todo.achievementCount)
  const percentage = total > 0 ? Math.round((achieved / total) * 100) : 0
  const myWorkComplete = isMyWorkComplete(todo.myWorkSummary)
  const palette = CARD_PALETTES[colorIndex % CARD_PALETTES.length]
  const time = formatISOTime(todo.deadline)
  const isDone =
    todo.status === 'SUCCESS' ||
    (todo.myWorkSummary.totalCount > 0 && todo.myWorkSummary.inProgressCount === 0)

  return (
    <ConvexCard
      bg={palette.bg}
      className={`cursor-pointer active:scale-[0.99] ${isDone ? 'opacity-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <TodoStatusBadge status={todo.status} />
          {todo.mode === 'TASK' && (
            <span className="rounded-full bg-white/55 px-2 py-0.5 text-[9px] font-black text-gray-600">
              TASK
            </span>
          )}
          {todo.myWorkSummary.totalCount > 0 && (
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
              style={{ background: myWorkComplete ? palette.accent : 'rgba(0,0,0,0.18)' }}
            >
              {myWorkComplete
                ? '내 작업 완료'
                : `내 작업 ${todo.myWorkSummary.successCount}/${todo.myWorkSummary.totalCount}`}
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

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold" style={{ color: palette.text, opacity: 0.6 }}>
            {achieved}/{total} {todo.mode === 'TASK' ? 'Task' : '인증'}
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
