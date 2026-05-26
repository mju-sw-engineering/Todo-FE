'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { ApiError } from '@/lib/apiClient'
import { evaluateTodo, getTodoDetail } from '@/services/todoService'
import { useAuth } from '@/store/authStore'
import type { MyTodoStatus, TodoDetail, TodoParticipant, TodoStatus } from '@/types/todo.types'

const AVATAR_COLORS = [
  'bg-primary-light text-primary',
  'bg-[#d4f0e4] text-[#2d7a56]',
  'bg-[#fde8d0] text-[#c25f1b]',
  'bg-[#e0d4f5] text-[#6b3fa0]',
]

const STATUS_LABEL: Record<TodoStatus, string> = {
  IN_PROGRESS: '진행중',
  SUCCESS: '성공',
  FAIL: '실패',
}

const STATUS_STYLE: Record<TodoStatus, string> = {
  IN_PROGRESS: 'bg-gray-100 text-gray-500',
  SUCCESS: 'bg-emerald-50 text-emerald-600',
  FAIL: 'bg-red-50 text-red-500',
}

const CERT_BADGE_LABEL: Record<MyTodoStatus, string> = {
  완료: '완료',
  '평가 대기중': '평가 대기',
  미완료: '미완료',
}

const CERT_BADGE_STYLE: Record<MyTodoStatus, string> = {
  완료: 'bg-primary text-white',
  '평가 대기중': 'bg-indigo-400 text-white',
  미완료: 'bg-gray-100 text-gray-400',
}

function getInitials(nickname: string): string {
  return nickname.trim().slice(0, 2)
}

function formatDeadline(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

function parseAchievementCount(value: string): { achieved: number; total: number } {
  const parts = value.split('/')
  if (parts.length === 2) {
    const achieved = parseInt(parts[0].trim(), 10)
    const total = parseInt(parts[1].trim(), 10)
    if (!isNaN(achieved) && !isNaN(total)) return { achieved, total }
  }
  return { achieved: 0, total: 0 }
}

function MemberCertCard({
  member,
  index,
  isCurrentUser,
  onCertify,
  canEvaluate,
  evaluated,
  isEvaluating,
  onEvaluatePass,
  onEvaluateFail,
}: {
  member: TodoParticipant
  index: number
  isCurrentUser: boolean
  onCertify: () => void
  canEvaluate: boolean
  evaluated: boolean
  isEvaluating: boolean
  onEvaluatePass: () => void
  onEvaluateFail: () => void
}) {
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length]
  const status = member.status
  const isCompleted = status === '완료'
  const isPending = status === '평가 대기중'
  const canCertify = isCurrentUser && status === '미완료'

  return (
    <div
      className={`rounded-[18px] overflow-hidden border border-border ${canCertify ? 'cursor-pointer active:scale-[0.99] transition-transform' : ''}`}
      onClick={canCertify ? onCertify : undefined}
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-3 bg-white">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${avatarColor}`}
          >
            {getInitials(member.nickname)}
          </div>
          <span className="text-[14px] font-semibold text-ink">{member.nickname}</span>
        </div>
        {status && (
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${CERT_BADGE_STYLE[status]}`}
          >
            {CERT_BADGE_LABEL[status]}
          </span>
        )}
      </div>

      {(isCompleted || isPending) && member.proofImageUrl ? (
        <div
          className="w-full h-32.5 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${member.proofImageUrl})` }}
        >
          <div
            className={`absolute inset-0 ${isCompleted ? 'bg-linear-to-t from-primary/30 to-transparent' : 'bg-linear-to-t from-indigo-900/20 to-transparent'}`}
          />
        </div>
      ) : (isCompleted || isPending) && !member.proofImageUrl ? (
        <div
          className={`w-full h-32.5 ${isCompleted ? 'bg-linear-to-br from-primary/20 to-primary/40' : 'bg-linear-to-br from-indigo-100 to-indigo-200'}`}
        />
      ) : canCertify ? (
        <div className="w-full h-32.5 bg-primary-light flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center">
            <span className="text-[22px] font-light text-primary/60 leading-none">+</span>
          </div>
          <span className="text-[12px] text-primary/50">인증 전 (사진 미선택)</span>
        </div>
      ) : (
        <div className="w-full h-32.5 bg-gray-50" />
      )}

      {/* 평가 버튼 */}
      {canEvaluate && !evaluated && (
        <div className="flex gap-2 px-4 py-3 bg-white border-t border-border/50">
          <button
            type="button"
            disabled={isEvaluating}
            onClick={(e) => {
              e.stopPropagation()
              onEvaluatePass()
            }}
            className="flex-1 py-2 bg-emerald-500 text-white text-[13px] font-semibold rounded-[10px] transition-all duration-200 hover:bg-emerald-600 disabled:opacity-50 active:scale-[0.98]"
          >
            긍정 (Pass)
          </button>
          <button
            type="button"
            disabled={isEvaluating}
            onClick={(e) => {
              e.stopPropagation()
              onEvaluateFail()
            }}
            className="flex-1 py-2 bg-red-500 text-white text-[13px] font-semibold rounded-[10px] transition-all duration-200 hover:bg-red-600 disabled:opacity-50 active:scale-[0.98]"
          >
            부정 (Fail)
          </button>
        </div>
      )}
      {canEvaluate && evaluated && (
        <div className="px-4 py-3 bg-white border-t border-border/50">
          <p className="text-[13px] text-center text-emerald-600 font-semibold">평가 완료</p>
        </div>
      )}
    </div>
  )
}

const CARD_CLASS =
  'flex-1 flex flex-col overflow-hidden bg-white animate-fade-up md:flex-none md:rounded-[28px] md:border md:border-border md:shadow-[0_8px_40px_rgba(91,79,207,0.10)] md:max-h-[calc(100dvh-8rem)]'

function TodoDetailContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const teamId = Number(params.teamId)
  const todoId = Number(params.todoId)
  const { token, user } = useAuth()

  const [todo, setTodo] = useState<TodoDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const myStatusParam = searchParams.get('myStatus') as MyTodoStatus | null
  const [showToast, setShowToast] = useState(() => searchParams.get('certified') === '1')
  const [evaluatedIds, setEvaluatedIds] = useState<Set<number>>(new Set())
  const [evaluatingId, setEvaluatingId] = useState<number | null>(null)
  const [evalError, setEvalError] = useState('')

  useEffect(() => {
    if (!showToast) return
    const t = setTimeout(() => setShowToast(false), 3000)
    return () => clearTimeout(t)
  }, [showToast])

  useEffect(() => {
    if (!token || !todoId) return
    getTodoDetail(todoId, token)
      .then((res) => setTodo(res))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : '투두를 불러오지 못했습니다.')
      })
      .finally(() => setIsLoading(false))
  }, [token, todoId])

  async function handleEvaluate(participantUserId: number, voteType: 'POSITIVE' | 'NEGATIVE') {
    if (!token || evaluatingId !== null) return
    setEvalError('')
    setEvaluatingId(participantUserId)
    try {
      await evaluateTodo(todoId, { targetUserId: participantUserId, voteType }, token)
      setEvaluatedIds((prev) => new Set([...prev, participantUserId]))
    } catch (err) {
      setEvalError(err instanceof ApiError ? err.message : '평가 중 오류가 발생했습니다.')
      setTimeout(() => setEvalError(''), 3000)
    } finally {
      setEvaluatingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className={`${CARD_CLASS} items-center justify-center`}>
        <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !todo) {
    return (
      <div className={`${CARD_CLASS} px-6 py-10 md:px-9`}>
        <button
          onClick={() => router.back()}
          className="text-[13px] font-semibold text-muted mb-8 text-left hover:text-primary transition-colors"
        >
          ← 뒤로
        </button>
        <p className="text-[14px] text-muted text-center">{error || '투두를 찾을 수 없습니다.'}</p>
      </div>
    )
  }

  const { achieved, total } = parseAchievementCount(todo.achievementCount)
  const percentage = total > 0 ? Math.round((achieved / total) * 100) : 0
  const effectiveMyStatus: MyTodoStatus | null = todo.myStatus ?? myStatusParam
  const canCertify = effectiveMyStatus === '미완료'

  function navigateToCertify() {
    router.push(`/teams/${teamId}/todos/${todoId}/certify?title=${encodeURIComponent(todo!.title)}`)
  }

  return (
    <div className={CARD_CLASS}>
      {/* 헤더 (스크롤 고정) */}
      <div className="px-6 pt-8 pb-4 md:px-9">
        <button
          onClick={() => router.back()}
          className="text-[13px] font-semibold text-muted mb-6 flex items-center gap-1 hover:text-primary transition-colors"
        >
          ← 할 일 상세
        </button>

        <div className="flex items-start gap-2 mb-2">
          <h1 className="text-[20px] font-bold text-ink flex-1 leading-snug">{todo.title}</h1>
          <span
            className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full mt-0.5 ${STATUS_STYLE[todo.status]}`}
          >
            {STATUS_LABEL[todo.status]}
          </span>
        </div>

        <p className="text-[13px] text-muted mb-5">
          {formatDeadline(todo.deadline)} 마감&nbsp;&nbsp;{todo.creatorNickname}
        </p>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[12px] font-semibold text-ink/60">달성 현황</span>
            <span className="text-[12px] text-primary font-semibold">
              {achieved}/{total}명 · {percentage}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 md:px-9">
        <p className="text-[13px] font-semibold text-ink/60 mb-3">인증 현황</p>
        <div className="flex flex-col gap-3">
          {todo.participants.map((member, idx) => {
            const byUserId = user?.userId ? member.userId === user.userId : false
            const byNickname =
              !byUserId && user?.nickname && user.nickname !== user.loginId
                ? member.nickname === user.nickname
                : false
            const isCurrentUser = byUserId || byNickname
            const canEvaluate = !isCurrentUser && member.status === '평가 대기중'
            return (
              <MemberCertCard
                key={member.userId}
                member={member}
                index={idx}
                isCurrentUser={isCurrentUser}
                onCertify={navigateToCertify}
                canEvaluate={canEvaluate}
                evaluated={evaluatedIds.has(member.userId)}
                isEvaluating={evaluatingId === member.userId}
                onEvaluatePass={() => handleEvaluate(member.userId, 'POSITIVE')}
                onEvaluateFail={() => handleEvaluate(member.userId, 'NEGATIVE')}
              />
            )
          })}
        </div>
      </div>

      {/* 바텀 버튼 (항상 고정) */}
      <div className="px-6 py-5 border-t border-border md:px-9">
        {canCertify ? (
          <button
            onClick={navigateToCertify}
            className="w-full py-3.75 bg-primary text-white text-[15px] font-semibold rounded-[14px] shadow-[0_4px_18px_rgba(91,79,207,0.22)] transition-all duration-200 hover:bg-primary-hover"
          >
            인증하기
          </button>
        ) : (
          <button
            onClick={() => router.back()}
            className="w-full py-3.75 bg-primary-light text-primary text-[15px] font-semibold rounded-[14px] transition-all duration-200 hover:bg-[#e0daf8]"
          >
            돌아가기
          </button>
        )}
      </div>

      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-sm bg-primary-light text-ink text-[14px] font-semibold text-center py-4 rounded-[14px] shadow-[0_4px_24px_rgba(91,79,207,0.18)] animate-fade-up z-50">
          인증샷이 업로드되었습니다
        </div>
      )}
      {evalError && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-sm bg-red-50 text-red-500 text-[14px] font-semibold text-center py-4 rounded-[14px] shadow-[0_4px_24px_rgba(239,68,68,0.18)] animate-fade-up z-50">
          {evalError}
        </div>
      )}
    </div>
  )
}

export default function TodoDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center bg-white md:rounded-[28px] md:border md:border-border md:shadow-[0_8px_40px_rgba(91,79,207,0.10)]">
          <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TodoDetailContent />
    </Suspense>
  )
}
