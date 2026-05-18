'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { ApiError } from '@/lib/apiClient'
import { getTodayTodos } from '@/services/todoService'
import { useAuth } from '@/store/authStore'
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
  '평가 대기중': 'bg-amber-400 text-white',
  미완료: 'bg-gray-100 text-gray-400',
}

const BAR_COLOR: Record<MyTodoStatus, string> = {
  완료: 'bg-primary',
  '평가 대기중': 'bg-amber-400',
  미완료: 'bg-gray-200',
}

function formatDate(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`
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

function TodoCard({ todo }: { todo: Todo }) {
  const { achieved, total } = parseAchievementCount(todo.achievementCount)
  const ratio = total > 0 ? achieved / total : 0
  const percentage = Math.round(ratio * 100)
  const isSuccess = todo.status === 'SUCCESS'

  return (
    <div
      className={`rounded-[18px] border border-border px-5 py-4 flex flex-col gap-3 ${
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

      <div
        className={`w-full py-2.5 rounded-[10px] text-[13px] font-semibold text-center ${MY_STATUS_STYLE[todo.myStatus]}`}
      >
        {todo.myStatus}
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
            className={`h-full rounded-full transition-all duration-500 ${BAR_COLOR[todo.myStatus]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

const CARD_CLASS =
  'flex-1 flex flex-col bg-white animate-fade-up md:flex-none md:rounded-[28px] md:border md:border-border md:shadow-[0_8px_40px_rgba(91,79,207,0.10)]'

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

  useEffect(() => {
    if (!showToast) return
    const t = setTimeout(() => setShowToast(false), 3000)
    return () => clearTimeout(t)
  }, [showToast])

  useEffect(() => {
    if (!token || !teamId) return
    getTodayTodos(teamId, token)
      .then((res) => setTodos(res.todos ?? []))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : '투두 목록을 불러오지 못했습니다.')
      })
      .finally(() => setIsLoading(false))
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
      <div className={`${CARD_CLASS} px-6 py-10 md:px-9 md:py-11`}>
        <h1 className="text-[22px] font-bold text-ink text-center mb-10">TodoTeam</h1>
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-[15px] text-muted text-center">
            {error ? '투두 목록을 불러오지 못했습니다.' : '아직 생성된 할 일이 없습니다!'}
          </p>
        </div>
        <button
          onClick={() => router.push(`/teams/${teamId}/todos/new`)}
          className="w-full py-3.75 bg-primary text-white text-[15px] font-semibold rounded-[14px] shadow-[0_4px_18px_rgba(91,79,207,0.22)] transition-all duration-200 hover:bg-primary-hover"
        >
          오늘의 할 일 생성
        </button>
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
      {/* 날짜·제목 */}
      <div className="px-6 pt-8 pb-4 md:px-9">
        <p className="text-[13px] text-muted mb-1">{formatDate(today)} 오늘</p>
        <h1 className="text-[26px] font-bold text-ink">할 일</h1>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-border px-6 md:px-9">
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

      {/* 투두 목록 */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3 md:px-9">
        {filteredTodos.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <p className="text-[14px] text-muted">해당하는 할 일이 없습니다</p>
          </div>
        ) : (
          filteredTodos.map((todo) => <TodoCard key={todo.todoId} todo={todo} />)
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="px-6 py-5 border-t border-border md:px-9">
        <button
          onClick={() => router.push(`/teams/${teamId}/todos/new`)}
          className="w-full py-3.75 bg-primary text-white text-[15px] font-semibold rounded-[14px] shadow-[0_4px_18px_rgba(91,79,207,0.22)] transition-all duration-200 hover:bg-primary-hover"
        >
          할 일 추가
        </button>
      </div>

      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-sm bg-primary-light text-ink text-[14px] font-semibold text-center py-4 rounded-[14px] shadow-[0_4px_24px_rgba(91,79,207,0.18)] animate-fade-up">
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
        <div className="flex-1 flex items-center justify-center bg-white md:rounded-[28px] md:border md:border-border md:shadow-[0_8px_40px_rgba(91,79,207,0.10)]">
          <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TodoListContent />
    </Suspense>
  )
}
