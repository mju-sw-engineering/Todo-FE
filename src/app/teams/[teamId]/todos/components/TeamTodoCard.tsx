'use client'

import { BlobAvatar } from '@/components/ui/BlobAvatar'
import { ConvexCard } from '@/components/ui/ConvexCard'
import { parseAchievementCount } from '@/lib/formatters'
import { formatISOTime } from '@/lib/dateUtils'
import {
  isMyWorkComplete,
  type Todo,
  type TodoParticipant,
  type WorkItemStatus,
} from '@/types/todo.types'
import type { TeamTodoVariant } from '@/hooks/useTeamTodos'

interface TeamTodoCardProps {
  todo: Todo
  variant: TeamTodoVariant
  onClick: () => void
}

const CARD_BG = 'var(--color-static-white)'
const CHECK_COLOR = 'var(--color-point)'

const STATUS_LABEL: Record<WorkItemStatus, string> = {
  SUCCESS: '제출 완료',
  FAIL: '마감 지남',
  IN_PROGRESS: '진행 중',
}

function badgeColor(status: WorkItemStatus, onHero: boolean): string {
  if (status === 'SUCCESS') return onHero ? 'var(--color-static-white)' : 'var(--color-primary)'
  if (status === 'FAIL') return 'var(--color-status-red)'
  return onHero
    ? 'color-mix(in srgb, var(--color-static-white) 45%, transparent)'
    : 'var(--color-neutral-50)'
}

interface ParticipantAvatarsProps {
  participants: TodoParticipant[]
  size: number
  onHero: boolean
}

function ParticipantAvatars({ participants, size, onHero }: ParticipantAvatarsProps) {
  if (participants.length === 0) return null

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hidden -mx-0.5 px-0.5 -my-0.5 py-0.5">
      {participants.map((p) => {
        const counts = p.totalCount > 1 ? ` (${p.successCount}/${p.totalCount})` : ''
        return (
          <div
            key={p.userId}
            className="relative shrink-0"
            title={`${p.nickname} · ${STATUS_LABEL[p.status]}${counts}`}
          >
            <BlobAvatar seed={p.nickname} size={size} />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 ${
                onHero ? 'border-primary' : 'border-white'
              }`}
              style={{ background: badgeColor(p.status, onHero) }}
            >
              {p.status === 'SUCCESS' && (
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2.5 6.2L5 8.7L9.5 3.5"
                    stroke={onHero ? 'var(--color-primary)' : '#fff'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function TeamTodoCard({ todo, variant, onClick }: TeamTodoCardProps) {
  const { achieved, total } = parseAchievementCount(todo.achievementCount)
  const percentage = total > 0 ? Math.round((achieved / total) * 100) : 0
  const myWorkComplete = isMyWorkComplete(todo.myWorkSummary)
  const time = formatISOTime(todo.deadline)
  const participants = todo.participants ?? []
  const unitLabel = todo.mode === 'TASK' ? 'Task' : '인증'

  const isDone = variant === 'done'
  const isOverdue = variant === 'overdue'
  // 다음 마감인 항목만 파란 테두리로 살짝 강조한다 — 카드 크기는 다른 항목과 동일하게 유지한다
  const isNext = variant === 'hero'

  return (
    <ConvexCard
      bg={CARD_BG}
      dense
      className={`cursor-pointer active:scale-[0.99] border ${
        isOverdue ? 'border-status-red/25 opacity-65' : isNext ? 'border-primary' : 'border-border'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex-1 min-w-0">
          <p
            className={`text-[14.5px] font-bold leading-snug truncate ${
              isDone ? 'text-muted' : 'text-ink'
            }`}
          >
            {todo.title}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 min-h-[18px]">
            {participants.length > 0 && (
              <ParticipantAvatars participants={participants} size={18} onHero={false} />
            )}
            <span
              className={`text-[11px] font-semibold whitespace-nowrap ${
                isOverdue ? 'text-status-red' : isNext ? 'text-primary' : 'text-muted'
              }`}
            >
              {isDone
                ? `완료 · ${achieved}/${total} ${unitLabel}`
                : isOverdue
                  ? `마감 지남 · ${achieved}/${total} ${unitLabel}`
                  : isNext
                    ? `다음 마감 · ${achieved}/${total} ${unitLabel}`
                    : `${achieved}/${total} ${unitLabel}`}
              {myWorkComplete && !isDone ? ' · 내 작업 완료' : ''}
            </span>
          </div>
        </div>

        {time && (
          <span
            className={`text-[13px] font-black tracking-tight shrink-0 tabular-nums ${
              isNext ? 'text-primary' : 'text-muted'
            }`}
          >
            ~{time}
          </span>
        )}

        {isDone && (
          <span
            className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 ring-[3px] ring-point-light"
            style={{ background: CHECK_COLOR }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path
                d="M2.5 6.2L5 8.7L9.5 3.5"
                stroke="var(--color-ink)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>

      <div className="w-full h-1.5 rounded-full overflow-hidden bg-neutral-30">
        <div
          className="h-full rounded-full transition-all duration-500 bg-primary"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </ConvexCard>
  )
}
