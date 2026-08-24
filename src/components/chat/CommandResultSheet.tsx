'use client'

import { useEffect, useState } from 'react'
import { IoFlame, IoSparkles } from 'react-icons/io5'
import { ApiError } from '@/lib/apiClient'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useAsyncTask } from '@/hooks/useAsyncTask'
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

interface CommandResultSheetProps {
  teamId: number
  messageId: number
  command: ChatCommand
  label: string
  token: string
  onClose: () => void
}

/** 채팅 명령어 칩을 탭했을 때 뜨는 결과 바텀시트 — command 값에 따라 내용만 분기한다 */
export function CommandResultSheet({
  teamId,
  messageId,
  command,
  label,
  token,
  onClose,
}: CommandResultSheetProps) {
  const { isLoading, error, run } = useAsyncTask(true)
  const [payload, setPayload] = useState<ChatCommandResult | null>(null)

  useEffect(() => {
    run(() => getChatCommandResult(teamId, messageId, token), {
      fallback: '결과를 불러오지 못했어요.',
      statusMessages: {
        403: '본인만 확인할 수 있는 결과예요.',
        404: '아직 결과가 없는 명령어예요.',
      },
    }).then((res) => {
      if (res) setPayload(res)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, messageId, token])

  return (
    <BottomSheet onClose={onClose}>
      <p className="flex items-center justify-center gap-1.5 text-[13px] font-bold text-muted">
        <IoSparkles size={13} />
        {label}
      </p>

      <div className="mt-4 min-h-24">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Spinner size="sm" />
          </div>
        )}

        {!isLoading && error && (
          <p className="text-[13px] text-status-red text-center py-6">{error}</p>
        )}

        {!isLoading && !error && payload?.status === 'PENDING' && (
          <p className="text-[13px] text-muted text-center py-6">
            아직 처리 중이에요. 잠시 후 다시 확인해주세요.
          </p>
        )}

        {!isLoading && !error && payload?.status === 'FAILED' && (
          <p className="text-[13px] text-status-red text-center py-6">
            결과를 만드는 데 실패했어요. 다시 시도해주세요.
          </p>
        )}

        {!isLoading && !error && payload?.status === 'DONE' && payload.result && (
          <CommandResultBody
            command={command}
            result={payload.result}
            teamId={teamId}
            messageId={messageId}
            token={token}
          />
        )}
      </div>

      <Button variant="secondary" onClick={onClose} className="mt-5">
        닫기
      </Button>
    </BottomSheet>
  )
}

interface CommandResultBodyProps {
  command: ChatCommand
  result: NonNullable<ChatCommandResult['result']>
  teamId: number
  messageId: number
  token: string
}

function CommandResultBody({ command, result, teamId, messageId, token }: CommandResultBodyProps) {
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
  if (result.todos.length === 0) {
    return (
      <p className="text-[13px] text-muted text-center py-6">30분 안에 마감인 할 일이 없어요.</p>
    )
  }
  return (
    <div className="flex flex-col gap-2.5">
      {result.todos.map((todo) => (
        <div key={todo.todoId} className="rounded-[14px] bg-gray-50 px-4 py-3">
          <p className="text-[14px] font-bold text-ink">{todo.title}</p>
          <p className="mt-1 text-[12px] font-semibold text-status-red">
            {formatFullDeadline(todo.deadline)} 마감
          </p>
          {todo.pendingAssigneeNicknames.length > 0 && (
            <p className="mt-1 text-[11.5px] text-muted">
              미완료: {todo.pendingAssigneeNicknames.join(', ')}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function TeamStatusBody({ result }: { result: TeamStatusResult }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-[14px] bg-primary-light py-3">
          <p className="text-[18px] font-black text-primary">{result.inProgressCount}</p>
          <p className="text-[11px] font-semibold text-primary/80 mt-0.5">진행중</p>
        </div>
        <div className="rounded-[14px] bg-emerald-50 py-3">
          <p className="text-[18px] font-black text-emerald-600">{result.successCount}</p>
          <p className="text-[11px] font-semibold text-emerald-600/80 mt-0.5">성공</p>
        </div>
        <div className="rounded-[14px] bg-status-red/10 py-3">
          <p className="text-[18px] font-black text-status-red">{result.failCount}</p>
          <p className="text-[11px] font-semibold text-status-red/80 mt-0.5">실패</p>
        </div>
      </div>

      {result.inProgressTodos.length > 0 && (
        <div className="flex flex-col gap-2">
          {result.inProgressTodos.map((todo) => (
            <div key={todo.todoId} className="rounded-[14px] bg-gray-50 px-4 py-3">
              <p className="text-[13.5px] font-bold text-ink">{todo.title}</p>
              <p className="mt-1 text-[11.5px] text-muted">
                {todo.completedWorkItemCount} / {todo.totalWorkItemCount}개 완료
              </p>
            </div>
          ))}
        </div>
      )}
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
      <p className="text-[13px] text-muted text-center py-6">
        {result.message ?? '지금은 추천할 만한 할 일이 없어요.'}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {result.items.map((item, index) => {
        const registered = registeredIndexes.has(index)
        return (
          <div key={index} className="rounded-[14px] bg-gray-50 px-4 py-3.5">
            <div className="flex items-start gap-1.5">
              <IoFlame size={14} className="text-secondary-50 mt-0.5 shrink-0" />
              <p className="text-[14px] font-bold text-ink flex-1">{item.title}</p>
            </div>
            {item.description && (
              <p className="mt-1.5 text-[12px] text-muted leading-relaxed">{item.description}</p>
            )}
            {item.deadline && (
              <p className="mt-1.5 text-[11.5px] font-semibold text-muted">
                {formatFullDeadline(item.deadline)} 마감
              </p>
            )}
            {itemErrors[index] && (
              <p className="mt-1.5 text-[11.5px] text-status-red">{itemErrors[index]}</p>
            )}
            <Button
              size="sm"
              fullWidth={false}
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
