'use client'

import Image from 'next/image'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { formatDate, formatDeadline, parseAchievementCount } from '@/lib/formatters'
import { ApiError } from '@/lib/apiClient'
import { getDailyEvaluation } from '@/services/teamService'
import { getTodayTodos } from '@/services/todoService'
import { useAuth } from '@/store/authStore'
import type { DailyEvaluationResponse } from '@/types/team.types'
import type { MyTodoStatus, Todo, TodoStatus } from '@/types/todo.types'

type TabType = 'all' | 'incomplete' | 'complete'

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

const MY_STATUS_STYLE: Record<MyTodoStatus, string> = {
  완료: 'bg-primary text-white',
  '평가 대기중': 'bg-indigo-400 text-white',
  미완료: 'bg-gray-100 text-gray-400',
}

const BAR_COLOR: Record<MyTodoStatus, string> = {
  완료: 'bg-primary',
  '평가 대기중': 'bg-indigo-400',
  미완료: 'bg-gray-200',
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
  if (evaluation === 'loading') {
    return (
      <div className="mx-6 mb-3 rounded-2xl bg-primary-light px-4 py-3 flex items-center justify-center h-14">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (evaluation === 'error') {
    return (
      <div className="mx-6 mb-3 rounded-2xl bg-primary-light px-4 py-3">
        <p className="text-[12px] text-muted text-center">
          어제의 평가가 아직 준비되지 않았습니다.
        </p>
      </div>
    )
  }

  const isDevil = evaluation.persona === 'DEVIL'

  return (
    <div className="mx-6 mb-3 rounded-2xl bg-primary-light px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="relative w-[52px] h-[52px] rounded-full overflow-hidden shrink-0">
          <Image
            src={isDevil ? '/images/devil.png' : '/images/angel.png'}
            alt={isDevil ? '악마 AI' : '천사 AI'}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-primary font-semibold mb-0.5">
            ({formatEvalDate(evaluation.date)})
          </p>
          <p className="text-[12px] text-ink leading-relaxed line-clamp-5">{evaluation.message}</p>
        </div>
      </div>
    </div>
  )
}

function TodoCard({ todo, onClick }: { todo: Todo; onClick: () => void }) {
  const { achieved, total } = parseAchievementCount(todo.achievementCount)
  const ratio = total > 0 ? achieved / total : 0
  const percentage = Math.round(ratio * 100)
  const isSuccess = todo.status === 'SUCCESS'
  const myStatus = todo.myStatus

  return (
    <div
      onClick={onClick}
      className={`rounded-[18px] border border-border px-5 py-4 flex flex-col gap-3 cursor-pointer transition-all duration-150 hover:border-primary/30 hover:shadow-[0_2px_12px_rgba(91,79,207,0.08)] active:scale-[0.99] ${
        isSuccess ? 'bg-amber-50/60' : 'bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[15px] font-semibold text-ink leading-snug flex-1">{todo.title}</span>
        <span
          className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[todo.status]}`}
        >
          {STATUS_LABEL[todo.status]}
        </span>
      </div>

      <div className="flex items-center gap-2 text-[13px] text-muted">
        <span>{formatDeadline(todo.deadline)}</span>
        <span>·</span>
        <span>{todo.creatorNickname}</span>
      </div>

      {myStatus && (
        <div
          className={`w-full py-2.5 rounded-[10px] text-[13px] font-semibold text-center ${MY_STATUS_STYLE[myStatus]}`}
        >
          {myStatus}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] text-muted">
            {achieved}/{total}명 인증
          </span>
          <span className="text-[12px] text-muted">{percentage}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${myStatus ? BAR_COLOR[myStatus] : 'bg-gray-200'}`}
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
    const t = setTimeout(() => setShowToast(false), 3000)
    return () => clearTimeout(t)
  }, [showToast])

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

  const filteredTodos = todos.filter((t) => {
    if (tab === 'complete') return t.status === 'SUCCESS'
    if (tab === 'incomplete') return t.status !== 'SUCCESS'
    return true
  })

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
      <div className="px-6 pt-8 pb-4">
        <button
          onClick={() => router.back()}
          className="text-[13px] font-semibold text-muted mb-4 flex items-center gap-1 hover:text-primary transition-colors"
        >
          ← 뒤로
        </button>
        <p className="text-[13px] text-muted mb-1">{formatDate(today)} 오늘</p>
        <h1 className="text-[26px] font-bold text-ink mb-4">할 일</h1>
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
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-sm bg-primary-light text-ink text-[14px] font-semibold text-center py-4 rounded-[14px] shadow-[0_4px_24px_rgba(91,79,207,0.18)] animate-fade-up z-50">
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
