'use client'

import Image from 'next/image'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { formatDate, formatDeadline, parseAchievementCount } from '@/lib/formatters'
import { ApiError } from '@/lib/apiClient'
import { useVoice } from '@/hooks/useVoice'
import { getDailyEvaluation } from '@/services/teamService'
import { getTodayTodos } from '@/services/todoService'
import { useAuth } from '@/store/authStore'
import type { DailyEvaluationResponse } from '@/types/team.types'
import { TodoStatusBadge } from '@/components/ui/TodoStatusBadge'
import type { MyTodoStatus, Todo } from '@/types/todo.types'

type TabType = 'all' | 'incomplete' | 'complete'

const MY_STATUS_STYLE: Record<MyTodoStatus, string> = {
  완료: 'bg-primary text-white',
  미완료: 'bg-gray-100 text-gray-400',
}

function formatEvalDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getMonth() + 1}월 ${d.getDate()}일 평가`
}

function AiEvaluationCard({
  evaluation,
}: {
  evaluation: DailyEvaluationResponse | 'error' | 'loading'
}) {
  const voice = useVoice()

  if (evaluation === 'loading') {
    return (
      <div className="mx-6 mb-3 rounded-2xl bg-primary-light px-4 py-3 flex items-center justify-center h-14">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (evaluation === 'error') {
    return (
      <div
        className="mx-6 mb-3 rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 60%, #fce7f3 100%)' }}
      >
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-[18px] leading-none">✨</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-[#4c1d95] leading-tight">AI 평가 준비 중</p>
            <p className="text-[11px] text-purple-400 mt-0.5">
              오늘 할 일을 완료하면 내일 평가가 도착해요
            </p>
          </div>
        </div>
      </div>
    )
  }

  const isDevil = evaluation.persona === 'DEVIL'
  const persona = isDevil ? 'DEVIL' : 'ANGEL'
  const isVoicePlaying = voice.isPlaying && voice.activePersona === persona

  return (
    <div
      className="mx-6 mb-3 rounded-2xl overflow-hidden shadow-[0_2px_14px_rgba(0,0,0,0.10)]"
      style={{
        background: isDevil
          ? 'linear-gradient(135deg, #1a0a3b 0%, #2e1065 60%, #3b0764 100%)'
          : 'linear-gradient(135deg, #fdf4ff 0%, #ede9fe 55%, #fce7f3 100%)',
      }}
    >
      {/* Top row: identity + date + play */}
      <div className="flex items-center gap-3 px-4 pt-3.5 pb-2.5">
        <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-[0_3px_10px_rgba(0,0,0,0.22)]">
          <Image
            src={isDevil ? '/images/devil.png' : '/images/angel.png'}
            alt={isDevil ? '악마 AI' : '천사 AI'}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-[14px] font-black leading-tight ${isDevil ? 'text-white' : 'text-[#4c1d95]'}`}
          >
            {isDevil ? '😈 악마 AI' : '😇 천사 AI'}
          </p>
          <p
            className={`text-[11px] font-semibold mt-0.5 ${isDevil ? 'text-purple-400' : 'text-purple-500'}`}
          >
            {formatEvalDate(evaluation.date)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => voice.toggle({ persona, text: evaluation.message })}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 active:scale-90 shrink-0 ${
            isVoicePlaying
              ? isDevil
                ? 'bg-white/25 text-white'
                : 'bg-pink-400 text-white'
              : isDevil
                ? 'bg-white/15 hover:bg-white/25 text-white'
                : 'bg-purple-100 hover:bg-purple-200 text-purple-600'
          }`}
          aria-label={isVoicePlaying ? '정지' : '재생'}
        >
          {voice.isLoading && voice.activePersona === persona ? (
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isVoicePlaying ? (
            <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
              <rect x="1" y="1" width="3" height="9" rx="1.2" />
              <rect x="7" y="1" width="3" height="9" rx="1.2" />
            </svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
              <path d="M2 1.5l8 4-8 4V1.5z" />
            </svg>
          )}
        </button>
      </div>

      {/* Divider */}
      <div className={`mx-4 h-px ${isDevil ? 'bg-white/10' : 'bg-purple-200/60'}`} />

      {/* Message */}
      <div className="px-4 pt-2.5 pb-4">
        <p
          className={`text-[13px] leading-relaxed line-clamp-5 ${isDevil ? 'text-purple-200/90' : 'text-[#4c1d95]/80'}`}
        >
          {evaluation.message}
        </p>
      </div>
    </div>
  )
}

function TodoCard({ todo, onClick }: { todo: Todo; onClick: () => void }) {
  const { achieved, total } = parseAchievementCount(todo.achievementCount)
  const percentage = total > 0 ? Math.round((achieved / total) * 100) : 0
  const myStatus = todo.myStatus

  const isDone = myStatus === '완료' || todo.status === 'FAIL'

  return (
    <div
      onClick={onClick}
      className={`rounded-[18px] border border-border bg-white px-5 py-4 flex flex-col gap-3 cursor-pointer transition-all duration-150 hover:border-primary/30 hover:shadow-[0_2px_12px_rgba(91,79,207,0.08)] active:scale-[0.99] ${isDone ? 'opacity-55' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[15px] font-semibold text-ink leading-snug flex-1">{todo.title}</span>
        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
          {myStatus && (
            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${MY_STATUS_STYLE[myStatus]}`}
            >
              {myStatus}
            </span>
          )}
          <TodoStatusBadge status={todo.status} />
        </div>
      </div>

      <div className="flex items-center gap-2 text-[13px] text-muted">
        <span>{formatDeadline(todo.deadline)}</span>
        <span>·</span>
        <span>{todo.creatorNickname}</span>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] text-muted">
            {achieved}/{total}명 인증
          </span>
          <span className="text-[12px] text-muted">{percentage}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${myStatus === '완료' || todo.status === 'SUCCESS' ? 'bg-primary' : 'bg-primary/40'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

const CARD_CLASS = 'flex-1 flex flex-col overflow-hidden bg-white animate-fade-up'

function TodoListContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const teamId = Number(params.teamId)
  const { token } = useAuth()

  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<TabType>('all')
  const [showToast, setShowToast] = useState(() => searchParams.get('created') === '1')
  const [aiEvaluation, setAiEvaluation] = useState<DailyEvaluationResponse | 'error' | 'loading'>(
    'loading'
  )

  useEffect(() => {
    if (!showToast) return
    router.replace(`/teams/${teamId}/todos`)
    const t = setTimeout(() => setShowToast(false), 3000)
    return () => clearTimeout(t)
  }, [showToast, router, teamId])

  useEffect(() => {
    if (!token || !teamId) return
    getTodayTodos(teamId, token)
      .then((res) => setTodos(res))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : '투두 목록을 불러오지 못했습니다.')
      })
      .finally(() => setIsLoading(false))
  }, [token, teamId])

  useEffect(() => {
    if (!token || !teamId) return
    getDailyEvaluation(teamId, token)
      .then((res) => setAiEvaluation(res))
      .catch(() => setAiEvaluation('error'))
  }, [token, teamId])

  if (isLoading) {
    return (
      <div className={`${CARD_CLASS} items-center justify-center`}>
        <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || todos.length === 0) {
    return (
      <div className={`${CARD_CLASS}`}>
        <div className="px-6 pt-8 pb-4">
          <button
            onClick={() => router.back()}
            className="text-[13px] font-semibold text-muted mb-6 flex items-center gap-1 hover:text-primary transition-colors"
          >
            ← 뒤로
          </button>
          <h1 className="text-[22px] font-bold text-ink text-center">TodoTeam</h1>
        </div>
        <AiEvaluationCard evaluation={aiEvaluation} />
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <p className="text-[15px] text-muted text-center mb-10">
            {error ? '투두 목록을 불러오지 못했습니다.' : '오늘 생성된 할 일이 없습니다'}
          </p>
        </div>
        <div className="px-6 py-5 border-t border-border">
          <button
            onClick={() => router.push(`/teams/${teamId}/todos/new`)}
            className="w-full py-3.75 bg-primary text-white text-[15px] font-semibold rounded-[14px] shadow-[0_4px_18px_rgba(91,79,207,0.22)] transition-all duration-200 hover:bg-primary-hover"
          >
            오늘의 할 일 생성
          </button>
        </div>
      </div>
    )
  }

  const today = new Date()

  const STATUS_ORDER: Record<string, number> = { IN_PROGRESS: 0, SUCCESS: 1, FAIL: 2 }

  const filteredTodos = todos
    .filter((t) => {
      if (tab === 'complete') return t.status === 'SUCCESS'
      if (tab === 'incomplete') return t.status !== 'SUCCESS'
      return true
    })
    .sort((a, b) => (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0))

  const completeCount = todos.filter((t) => t.status === 'SUCCESS').length
  const incompleteCount = todos.filter((t) => t.status !== 'SUCCESS').length

  const TAB_ITEMS: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: '전체', count: todos.length },
    { key: 'incomplete', label: '미완료', count: incompleteCount },
    { key: 'complete', label: '완료', count: completeCount },
  ]

  return (
    <div className={CARD_CLASS}>
      {/* 헤더 (스크롤 고정) */}
      <div className="px-6 pt-5 pb-2">
        <button
          onClick={() => router.back()}
          className="text-[13px] font-semibold text-muted mb-3 flex items-center gap-1 hover:text-primary transition-colors"
        >
          ← 뒤로
        </button>
        <p className="text-[13px] text-muted mb-0.5">{formatDate(today)} 오늘</p>
        <h1 className="text-[26px] font-bold text-ink mb-2">할 일</h1>
      </div>

      {/* AI 하루 평가 카드 */}
      <AiEvaluationCard evaluation={aiEvaluation} />

      {/* 탭 (스크롤 고정) */}
      <div className="flex border-b border-border px-6">
        {TAB_ITEMS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-2.5 pt-1 mr-5 text-[14px] font-semibold border-b-2 transition-colors duration-150 ${
              tab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {label} {count}
          </button>
        ))}
      </div>

      {/* 투두 목록 (스크롤) */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
        {filteredTodos.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <p className="text-[14px] text-muted">해당하는 할 일이 없습니다</p>
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <TodoCard
              key={todo.todoId}
              todo={todo}
              onClick={() =>
                router.push(
                  `/teams/${teamId}/todos/${todo.todoId}?myStatus=${encodeURIComponent(todo.myStatus ?? '')}`
                )
              }
            />
          ))
        )}
      </div>

      {/* 바텀 버튼 (항상 고정) */}
      <div className="px-6 py-5 border-t border-border">
        <button
          onClick={() => router.push(`/teams/${teamId}/todos/new`)}
          className="w-full py-3.75 bg-primary text-white text-[15px] font-semibold rounded-[14px] shadow-[0_4px_18px_rgba(91,79,207,0.22)] transition-all duration-200 hover:bg-primary-hover"
        >
          할 일 추가
        </button>
      </div>

      {showToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-sm bg-primary-light text-ink text-[14px] font-semibold text-center py-4 rounded-[14px] shadow-[0_4px_24px_rgba(91,79,207,0.18)] animate-fade-up z-50">
          할 일이 생성되었습니다
        </div>
      )}
    </div>
  )
}

export default function TodoListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center overflow-hidden bg-white">
          <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TodoListContent />
    </Suspense>
  )
}
