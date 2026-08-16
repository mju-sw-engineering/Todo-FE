'use client'

import { BlobAvatar } from '@/components/ui/BlobAvatar'
import { ConvexCard } from '@/components/ui/ConvexCard'
import { TodoStatusBadge } from '@/components/ui/TodoStatusBadge'
import { parseAchievementCount } from '@/lib/formatters'
import { formatISOTime } from '@/lib/dateUtils'
import { isMyWorkComplete, type Todo, type TodoDetail } from '@/types/todo.types'

interface TeamTodoCardProps {
  todo: Todo
  detail?: TodoDetail
  onClick: () => void
}

/** 홈 카드와 같은 톤 — 흰 카드 + 파랑(진행) 포인트, 노랑(#FFE042)은 완료 체크에만 — 60:30:10 규칙 */
const CARD_BG = '#ffffff'
const PROGRESS_COLOR = 'var(--color-primary)'
const CHECK_COLOR = 'var(--color-point)'
const TEXT_ACTIVE = 'var(--color-ink)'
const TEXT_DONE = 'var(--color-muted)'

export function TeamTodoCard({ todo, detail, onClick }: TeamTodoCardProps) {
  const { achieved, total } = parseAchievementCount(todo.achievementCount)
  const percentage = total > 0 ? Math.round((achieved / total) * 100) : 0
  const myWorkComplete = isMyWorkComplete(todo.myWorkSummary)
  const time = formatISOTime(todo.deadline)
  const isDone =
    todo.status === 'SUCCESS' ||
    (todo.myWorkSummary.totalCount > 0 && todo.myWorkSummary.inProgressCount === 0)
  const titleColor = isDone ? TEXT_DONE : TEXT_ACTIVE
  const workItems = detail
    ? detail.mode === 'TASK'
      ? (detail.tasks ?? [])
      : (detail.directAssignees ?? [])
    : []

  return (
    <ConvexCard
      bg={CARD_BG}
      className="cursor-pointer active:scale-[0.99] border border-border"
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <TodoStatusBadge status={todo.status} />
          {todo.mode === 'TASK' && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-black text-gray-600">
              TASK
            </span>
          )}
          {todo.myWorkSummary.totalCount > 0 && (
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                myWorkComplete ? 'text-ink' : 'text-gray-600 bg-gray-100'
              }`}
              style={myWorkComplete ? { background: CHECK_COLOR } : undefined}
            >
              {myWorkComplete
                ? '내 작업 완료'
                : `내 작업 ${todo.myWorkSummary.successCount}/${todo.myWorkSummary.totalCount}`}
            </span>
          )}
        </div>
        {time && (
          <span className="text-[14px] font-black tracking-tight text-muted shrink-0">~{time}</span>
        )}
      </div>

      <p className="text-[17px] font-black leading-snug" style={{ color: titleColor }}>
        {todo.title}
      </p>

      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-semibold text-muted whitespace-nowrap">
            {achieved}/{total} {todo.mode === 'TASK' ? 'Task' : '인증'}
          </span>
          <span className="text-[12px] font-black text-muted shrink-0">{percentage}%</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden bg-gray-100">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%`, background: PROGRESS_COLOR }}
          />
        </div>
      </div>

      {workItems.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hidden -mx-0.5 px-0.5">
          {workItems.map((w) => (
            <div
              key={w.workItemId}
              className="relative shrink-0"
              title={`${w.assigneeNickname ?? '미배정'} · ${
                w.status === 'SUCCESS' ? '제출 완료' : w.status === 'FAIL' ? '마감 지남' : '진행 중'
              }`}
            >
              <BlobAvatar seed={w.assigneeNickname ?? '?'} size={26} />
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 border-white"
                style={{
                  background:
                    w.status === 'SUCCESS'
                      ? PROGRESS_COLOR
                      : w.status === 'FAIL'
                        ? '#FF6648'
                        : '#e5e5e5',
                }}
              >
                {w.status === 'SUCCESS' && (
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
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
            </div>
          ))}
        </div>
      )}
    </ConvexCard>
  )
}
