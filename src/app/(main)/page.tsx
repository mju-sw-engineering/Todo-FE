'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getTeams } from '@/services/teamService'
import { getTodayTodos } from '@/services/todoService'
import { useAuth } from '@/store/authStore'
import type { MyTodoStatus, Todo, TodoStatus } from '@/types/todo.types'

type TabType = 'all' | 'incomplete' | 'complete'

interface TodoWithTeam extends Todo {
  teamId: number
  teamName: string
}

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

function MyTodoCard({ todo, onClick }: { todo: TodoWithTeam; onClick: () => void }) {
  const { achieved, total } = parseAchievementCount(todo.achievementCount)
  const percentage = total > 0 ? Math.round((achieved / total) * 100) : 0
  const myStatus = todo.myStatus

  return (
    <div
      onClick={onClick}
      className="rounded-[18px] border border-border bg-white px-5 py-4 flex flex-col gap-3 cursor-pointer transition-all duration-150 hover:border-primary/30 hover:shadow-[0_2px_12px_rgba(91,79,207,0.08)] active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full truncate max-w-30">
              {todo.teamName}
            </span>
            <span
              className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[todo.status]}`}
            >
              {STATUS_LABEL[todo.status]}
            </span>
          </div>
          <p className="text-[15px] font-semibold text-ink leading-snug">{todo.title}</p>
          <p className="text-[12px] text-muted mt-0.5">{formatDeadline(todo.deadline)} 마감</p>
        </div>
        {myStatus && (
          <span
            className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full mt-0.5 ${MY_STATUS_STYLE[myStatus]}`}
          >
            {myStatus === '평가 대기중' ? '평가 대기' : myStatus}
          </span>
        )}
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
            className={`h-full rounded-full transition-all duration-500 ${myStatus ? BAR_COLOR[myStatus] : 'bg-gray-200'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const { token } = useAuth()

  const [todos, setTodos] = useState<TodoWithTeam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tab, setTab] = useState<TabType>('all')

  useEffect(() => {
    if (!token) return

    async function load() {
      try {
        const { teams } = await getTeams(token!)
        if (teams.length === 0) {
          setTodos([])
          return
        }

        const results = await Promise.allSettled(
          teams.map((team) =>
            getTodayTodos(team.teamId, token!).then((teamTodos) =>
              teamTodos
                .filter((t) => t.myStatus !== null)
                .map((t) => ({ ...t, teamId: team.teamId, teamName: team.teamName }))
            )
          )
        )

        const merged = results
          .filter((r): r is PromiseFulfilledResult<TodoWithTeam[]> => r.status === 'fulfilled')
          .flatMap((r) => r.value)

        merged.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        setTodos(merged)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [token])

  const today = new Date()

  const filteredTodos = todos.filter((t) => {
    if (tab === 'complete') return t.myStatus === '완료' || t.myStatus === '평가 대기중'
    if (tab === 'incomplete') return t.myStatus === '미완료'
    return true
  })

  const completeCount = todos.filter(
    (t) => t.myStatus === '완료' || t.myStatus === '평가 대기중'
  ).length
  const incompleteCount = todos.filter((t) => t.myStatus === '미완료').length

  const TAB_ITEMS: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: '전체', count: todos.length },
    { key: 'incomplete', label: '미완료', count: incompleteCount },
    { key: 'complete', label: '완료', count: completeCount },
  ]

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center pb-16">
        <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white animate-fade-up">
      {/* 헤더 (스크롤 고정) */}
      <div className="px-5 pt-6 pb-4">
        <p className="text-[13px] text-muted mb-1">{formatDate(today)} 오늘</p>
        <h1 className="text-[26px] font-bold text-ink">내 할 일</h1>
      </div>

      {/* 탭 (스크롤 고정) */}
      <div className="flex border-b border-border px-5">
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

      {/* 할일 목록 (스크롤 / pb-16 = 바텀 네비 높이) */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-16 flex flex-col gap-3">
        {todos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-20">
            <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center mb-1">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <p className="text-[15px] font-semibold text-ink">오늘 할당된 할 일이 없습니다</p>
            <p className="text-[13px] text-muted">팀에서 할 일을 생성해보세요</p>
            <button
              onClick={() => router.push('/teams')}
              className="mt-4 px-5 py-2.5 bg-primary text-white text-[14px] font-semibold rounded-xl shadow-[0_4px_18px_rgba(91,79,207,0.22)] transition-all duration-200 hover:bg-primary-hover"
            >
              내 팀 보기
            </button>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-[14px] text-muted">해당하는 할 일이 없습니다</p>
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <MyTodoCard
              key={`${todo.teamId}-${todo.todoId}`}
              todo={todo}
              onClick={() =>
                router.push(
                  `/teams/${todo.teamId}/todos/${todo.todoId}?myStatus=${encodeURIComponent(todo.myStatus ?? '')}`
                )
              }
            />
          ))
        )}
      </div>
    </div>
  )
}
