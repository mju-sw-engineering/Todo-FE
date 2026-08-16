'use client'

import Image from 'next/image'
import { BlobAvatar } from '@/components/ui/BlobAvatar'
import { ConvexCard } from '@/components/ui/ConvexCard'
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
  onClick: () => void
}

/** 흰 카드 + 파랑(진행) 포인트, 노랑(#FFE042)은 완료 체크에만 — 60:30:10 규칙 */
const CARD_BG = '#ffffff'
const PROGRESS_COLOR = 'var(--color-primary)'
const CHECK_COLOR = 'var(--color-point)'
const TEXT_ACTIVE = 'var(--color-ink)'
const TEXT_DONE = 'var(--color-muted)'

/**
 * CSS line-clamp(-webkit-box)는 flex 자식으로 두면 일부 웹뷰에서 높이 계산이 깨져
 * 카드 내용이 통째로 안 보이는 문제가 있었다. 대신 문자열 자체를 2줄 분량으로
 * 미리 잘라서, 평범한 블록 요소 + overflow-hidden만으로 높이를 고정한다.
 */
function truncateTitle(title: string, maxChars = 26): string {
  if (title.length <= maxChars) return title
  return `${title.slice(0, maxChars).trimEnd()}…`
}

export function MyTodoCard({ todo, onClick }: MyTodoCardProps) {
  const { achieved, total } = parseAchievementCount(todo.achievementCount)
  const percentage = total > 0 ? Math.round((achieved / total) * 100) : 0
  const myWorkComplete = isMyWorkComplete(todo.myWorkSummary)
  const time = formatISOTime(todo.deadline)
  const titleColor = myWorkComplete ? TEXT_DONE : TEXT_ACTIVE

  return (
    <ConvexCard
      bg={CARD_BG}
      className="cursor-pointer active:scale-[0.99] border border-border"
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 min-w-0 text-[12px] font-semibold text-muted truncate">
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
            <span className="text-[13px] font-black tracking-tight text-muted shrink-0">
              ~{time}
            </span>
          )
        )}
      </div>

      <div className="flex items-start gap-2.5">
        <span
          className="w-5.5 h-5.5 rounded-full shrink-0 flex items-center justify-center"
          style={
            myWorkComplete
              ? { background: CHECK_COLOR }
              : { border: '2px solid rgba(0,0,0,0.15)', background: '#f9fafb' }
          }
          aria-label={myWorkComplete ? '내 할 일 완료' : '내 할 일 미완료'}
          role="img"
        >
          {myWorkComplete && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2.5 6.2L5 8.7L9.5 3.5"
                stroke="var(--color-ink)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <div className="flex-1 min-w-0 h-12 overflow-hidden">
          <p className="text-[17px] font-black leading-6" style={{ color: titleColor }}>
            {truncateTitle(todo.title)}
          </p>
        </div>
      </div>

      <div>
        <div className="w-full h-2 rounded-full overflow-hidden bg-gray-100">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%`, background: PROGRESS_COLOR }}
          />
        </div>
        <p className="mt-1.5 text-right text-[11px] font-bold text-muted whitespace-nowrap">
          {achieved}/{total} {todo.mode === 'TASK' ? 'Task' : '인증'}
        </p>
      </div>
    </ConvexCard>
  )
}
