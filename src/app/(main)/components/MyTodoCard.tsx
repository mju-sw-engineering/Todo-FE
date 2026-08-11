'use client'

import Image from 'next/image'
import { BlobAvatar } from '@/components/ui/BlobAvatar'
import { ConvexCard } from '@/components/ui/ConvexCard'
import { CARD_PALETTES } from '@/lib/cardPalettes'
import { parseAchievementCount } from '@/lib/formatters'
import { formatISOTime } from '@/lib/dateUtils'
import { isMyWorkComplete, type Todo } from '@/types/todo.types'

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
  const myWorkComplete = isMyWorkComplete(todo.myWorkSummary)
  const palette = CARD_PALETTES[colorIndex % CARD_PALETTES.length]
  const time = formatISOTime(todo.deadline)
  const dimmed = todo.myWorkSummary.inProgressCount === 0

  return (
    <ConvexCard
      bg={palette.bg}
      className={`cursor-pointer active:scale-[0.99] ${dimmed ? 'opacity-50' : ''}`}
      onClick={onClick}
      shadow={false}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="flex items-center gap-1.5 min-w-0 text-[12px] font-semibold truncate"
          style={{ color: palette.text, opacity: 0.65 }}
        >
          {todo.teamImageUrl ? (
            <span className="w-4 h-4 rounded-full overflow-hidden shrink-0 inline-block relative">
              <Image src={todo.teamImageUrl} alt="" fill className="object-cover" unoptimized />
            </span>
          ) : (
            <span className="shrink-0 inline-block">
              <BlobAvatar seed={todo.teamName} size={16} />
            </span>
          )}
          {todo.teamName}
        </span>
        {todo.status === 'FAIL' ? (
          <span className="text-[12px] font-bold text-status-red shrink-0">마감 지남</span>
        ) : (
          time && (
            <span
              className="text-[13px] font-black tracking-tight shrink-0"
              style={{ color: palette.accent }}
            >
              ~{time}
            </span>
          )
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <span
          className="w-5.5 h-5.5 rounded-full shrink-0 flex items-center justify-center"
          style={
            myWorkComplete
              ? { background: palette.accent }
              : { border: '2px solid rgba(0,0,0,0.15)', background: 'rgba(255,255,255,0.6)' }
          }
          aria-label={myWorkComplete ? '내 할 일 완료' : '내 할 일 미완료'}
          role="img"
        >
          {myWorkComplete && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2.5 6.2L5 8.7L9.5 3.5"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <p className="text-[17px] font-black leading-snug" style={{ color: palette.text }}>
          {todo.title}
        </p>
      </div>

      <div>
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.5)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%`, background: palette.accent }}
          />
        </div>
        <p
          className="mt-1.5 text-right text-[11px] font-semibold"
          style={{ color: palette.text, opacity: 0.65 }}
        >
          {achieved}/{total} {todo.mode === 'TASK' ? 'Task' : '인증'}
        </p>
      </div>
    </ConvexCard>
  )
}
