'use client'

import { useEffect, useRef, useState } from 'react'
import { IoFlame } from 'react-icons/io5'
import { ApiError } from '@/lib/apiClient'
import { Button } from '@/components/ui/Button'
import { BeeAvatar } from '@/components/ui/BeeAvatar'
import { getChatCommandResult, registerTodoRecommendationItem } from '@/services/chatService'
import type {
  ChatCommand,
  ChatCommandResult,
  DeadlineApproachingResult,
  TeamStatusResult,
  TodoRecommendationResult,
} from '@/types/chat.types'

function formatFullDeadline(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${h}:${m}`
}

/** 결과가 아직 PENDING이면 이 주기로 다시 확인한다 */
const POLL_MS = 2500

interface BotReplyBubbleProps {
  teamId: number
  messageId: number
  command: ChatCommand
  token: string
}

/**
 * 슬래시 명령어 메시지 바로 아래에 "비니"가 답장하는 것처럼 결과를 보여준다.
 * 예전엔 칩을 탭해야 시트가 열렸는데, 이제 항상 자동으로 뜬다.
 * 서버가 비동기로 처리하는 명령어라 PENDING이면 DONE/FAILED가 될 때까지 짧게 폴링한다.
 */
export function BotReplyBubble({ teamId, messageId, command, token }: BotReplyBubbleProps) {
  const [payload, setPayload] = useState<ChatCommandResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchOnce() {
      try {
        const res = await getChatCommandResult(teamId, messageId, token)
        if (cancelled) return
        setPayload(res)
        if (res.status === 'PENDING') {
          timerRef.current = setTimeout(fetchOnce, POLL_MS)
        }
      } catch (err) {
        if (cancelled) return
        const status = err instanceof ApiError ? err.status : undefined
        setErrorMessage(
          status === 403
            ? '본인만 확인할 수 있는 결과예요.'
            : status === 404
              ? '아직 결과가 없는 명령어예요.'
              : '결과를 불러오지 못했어요.'
        )
      }
    }

    fetchOnce()
    return () => {
      cancelled = true
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [teamId, messageId, token])

  return (
    <div className="mt-0.5 flex items-end gap-2">
      <div className="mt-0.5 shrink-0 self-start">
        <BeeAvatar size={32} />
      </div>
      <div className="flex max-w-[78%] flex-col items-start gap-0.5">
        <span className="ml-1 text-[11px] font-semibold text-ink/50">비니</span>
        <div className="rounded-2xl rounded-bl-sm border border-border bg-gray-50 px-4 py-3.5">
          {!payload && !errorMessage && (
            <div className="flex items-center gap-1.5 py-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          )}

          {errorMessage && <p className="text-[13px] text-status-red">{errorMessage}</p>}

          {payload?.status === 'PENDING' && (
            <p className="text-[13px] text-muted">확인하고 있어요...</p>
          )}

          {payload?.status === 'FAILED' && (
            <p className="text-[13px] text-status-red">결과를 만드는 데 실패했어요.</p>
          )}

          {payload?.status === 'DONE' && payload.result && (
            <ResultBody
              command={command}
              result={payload.result}
              teamId={teamId}
              messageId={messageId}
              token={token}
            />
          )}
        </div>
      </div>
    </div>
  )
}

interface ResultBodyProps {
  command: ChatCommand
  result: NonNullable<ChatCommandResult['result']>
  teamId: number
  messageId: number
  token: string
}

function ResultBody({ command, result, teamId, messageId, token }: ResultBodyProps) {
  if (command === 'DEADLINE_APPROACHING') {
    return <DeadlineApproachingBody result={result as DeadlineApproachingResult} />
  }
  if (command === 'TEAM_STATUS') {
    return <TeamStatusBody result={result as TeamStatusResult} />
  }
  return (
    <TodoRecommendationBody
      result={result as TodoRecommendationResult}
      teamId={teamId}
      messageId={messageId}
      token={token}
    />
  )
}

function DeadlineApproachingBody({ result }: { result: DeadlineApproachingResult }) {
  const todos = result.todos ?? []
  if (todos.length === 0) {
    return <p className="text-[13px] text-muted">30분 안에 마감인 할 일이 없어요.</p>
  }
  return (
    <div className="flex w-64 max-w-full flex-col gap-2">
      {todos.map((todo) => {
        const pending = todo.pendingAssigneeNicknames ?? []
        return (
          <div key={todo.todoId} className="rounded-[12px] bg-white px-3.5 py-2.5">
            <p className="text-[13.5px] font-bold text-ink">{todo.title}</p>
            <p className="mt-1 text-[11.5px] font-semibold text-status-red">
              {formatFullDeadline(todo.deadline)} 마감
            </p>
            {pending.length > 0 && (
              <p className="mt-1 text-[11px] text-muted">미완료: {pending.join(', ')}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TeamStatusBody({ result }: { result: TeamStatusResult }) {
  const inProgressTodos = result.inProgressTodos ?? []
  const inProgress = result.inProgressCount ?? 0
  const success = result.successCount ?? 0
  const fail = result.failCount ?? 0

  if (inProgress + success + fail === 0) {
    return <p className="text-[13px] text-muted">아직 진행 중인 할 일이 없어요.</p>
  }

  return (
    <div className="flex w-64 max-w-full flex-col gap-3">
      <div className="flex overflow-hidden rounded-[14px] border border-border">
        <StatCell value={inProgress} label="진행중" valueClassName="text-primary" />
        <div className="w-px shrink-0 bg-border" />
        <StatCell value={success} label="성공" valueClassName="text-meadow-dark" />
        <div className="w-px shrink-0 bg-border" />
        <StatCell value={fail} label="실패" valueClassName="text-status-red" />
      </div>

      {inProgressTodos.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {inProgressTodos.map((todo) => (
            <div key={todo.todoId} className="rounded-[12px] bg-white px-3.5 py-2.5">
              <p className="text-[12.5px] font-bold text-ink">{todo.title}</p>
              <p className="mt-0.5 text-[11px] text-muted">
                {todo.completedWorkItemCount} / {todo.totalWorkItemCount}개 완료
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCell({
  value,
  label,
  valueClassName,
}: {
  value: number
  label: string
  valueClassName: string
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-0.5 bg-white py-3">
      <span className={`text-[19px] font-black tabular-nums ${valueClassName}`}>{value}</span>
      <span className="text-[10.5px] font-semibold text-muted">{label}</span>
    </div>
  )
}

function TodoRecommendationBody({
  result,
  teamId,
  messageId,
  token,
}: {
  result: TodoRecommendationResult
  teamId: number
  messageId: number
  token: string
}) {
  const [registeredIndexes, setRegisteredIndexes] = useState<Set<number>>(new Set())
  const [registeringIndex, setRegisteringIndex] = useState<number | null>(null)
  const [itemErrors, setItemErrors] = useState<Record<number, string>>({})

  async function handleRegister(index: number) {
    setRegisteringIndex(index)
    setItemErrors((prev) => ({ ...prev, [index]: '' }))
    try {
      await registerTodoRecommendationItem(teamId, messageId, index, token)
      setRegisteredIndexes((prev) => new Set(prev).add(index))
    } catch (err) {
      const status = err instanceof ApiError ? err.status : undefined
      setItemErrors((prev) => ({
        ...prev,
        [index]: status === 409 ? '이미 등록됐어요.' : '등록에 실패했어요. 다시 시도해주세요.',
      }))
    } finally {
      setRegisteringIndex(null)
    }
  }

  if (!result.items || result.items.length === 0) {
    return (
      <p className="text-[13px] text-muted">
        {result.message ?? '지금은 추천할 만한 할 일이 없어요.'}
      </p>
    )
  }

  return (
    <div className="flex w-64 max-w-full flex-col gap-2">
      {result.items.map((item, index) => {
        const registered = registeredIndexes.has(index)
        return (
          <div key={index} className="rounded-[12px] bg-white px-3.5 py-3">
            <div className="flex items-start gap-1.5">
              <IoFlame size={13} className="mt-0.5 shrink-0 text-secondary-50" />
              <p className="flex-1 text-[13.5px] font-bold text-ink">{item.title}</p>
            </div>
            {item.description && (
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">{item.description}</p>
            )}
            {item.deadline && (
              <p className="mt-1.5 text-[11px] font-semibold text-muted">
                {formatFullDeadline(item.deadline)} 마감
              </p>
            )}
            {itemErrors[index] && (
              <p className="mt-1.5 text-[11px] text-status-red">{itemErrors[index]}</p>
            )}
            <Button
              size="sm"
              variant={registered ? 'secondary' : 'primary'}
              disabled={registered || registeringIndex === index}
              onClick={() => handleRegister(index)}
              className="mt-2.5"
            >
              {registered ? '등록됨' : registeringIndex === index ? '등록 중...' : '등록'}
            </Button>
          </div>
        )
      })}
    </div>
  )
}
