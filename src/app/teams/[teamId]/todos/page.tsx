'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
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

const MY_STATUS_LABEL: Record<MyTodoStatus, string> = {
  COMPLETED: '내가 완료함',
  PENDING: '평가 대기중',
  INCOMPLETE: '미완료',
}

const MY_STATUS_STYLE: Record<MyTodoStatus, string> = {
  COMPLETED: 'bg-primary text-white',
  PENDING: 'bg-amber-400 text-white',
  INCOMPLETE: 'bg-gray-100 text-gray-400',
}

const BAR_COLOR: Record<MyTodoStatus, string> = {
  COMPLETED: 'bg-primary',
  PENDING: 'bg-amber-400',
  INCOMPLETE: 'bg-gray-200',
}

function formatDate(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}

function TodoCard({ todo }: { todo: Todo }) {
  const ratio = todo.totalCount > 0 ? todo.achievedCount / todo.totalCount : 0
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
        <span>{todo.deadline}</span>
        <span>·</span>
        <span>{todo.creatorNickname}</span>
      </div>

      <button
        className={`w-full py-2.5 rounded-[10px] text-[13px] font-semibold text-center ${MY_STATUS_STYLE[todo.myStatus]}`}
      >
        {MY_STATUS_LABEL[todo.myStatus]}
      </button>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] text-muted">
            {todo.achievedCount}/{todo.totalCount}명 인증
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

const MOCK_TODOS: Todo[] = [
  {
    todoId: 1,
    teamId: 1,
    title: '팀 회의 자료 준비',
    deadline: '18:00',
    description: null,
    creatorNickname: '이서연',
    status: 'IN_PROGRESS',
    myStatus: 'COMPLETED',
    achievedCount: 2,
    totalCount: 4,
  },
  {
    todoId: 2,
    teamId: 1,
    title: '주간 리포트 작성',
    deadline: '20:00',
    description: null,
    creatorNickname: '김민준',
    status: 'IN_PROGRESS',
    myStatus: 'PENDING',
    achievedCount: 2,
    totalCount: 4,
  },
  {
    todoId: 3,
    teamId: 1,
    title: '코드 리뷰 완료',
    deadline: '22:00',
    description: null,
    creatorNickname: '최유진',
    status: 'IN_PROGRESS',
    myStatus: 'INCOMPLETE',
    achievedCount: 1,
    totalCount: 4,
  },
  {
    todoId: 4,
    teamId: 1,
    title: '디자인 시안 검토',
    deadline: '14:00',
    description: null,
    creatorNickname: '박지호',
    status: 'SUCCESS',
    myStatus: 'COMPLETED',
    achievedCount: 4,
    totalCount: 4,
  },
]

export default function TodoListPage() {
  const router = useRouter()
  const params = useParams()
  const teamId = Number(params.teamId)
  const [tab, setTab] = useState<TabType>('all')

  const today = new Date()
  const todos = MOCK_TODOS

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

  if (todos.length === 0) {
    return (
      <div className="flex-1 flex flex-col bg-white px-6 py-10 animate-fade-up">
        <h1 className="text-[22px] font-bold text-ink text-center mb-10">TodoTeam</h1>
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-[15px] text-muted text-center">아직 생성된 할 일이 없습니다!</p>
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

  return (
    <div className="flex-1 flex flex-col bg-white animate-fade-up">
      <div className="px-6 pt-8 pb-4">
        <p className="text-[13px] text-muted mb-1">{formatDate(today)} 오늘</p>
        <h1 className="text-[26px] font-bold text-ink">할 일</h1>
      </div>

      <div className="flex gap-0 border-b border-border px-6">
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

      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3 pb-24">
        {filteredTodos.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <p className="text-[14px] text-muted">해당하는 할 일이 없습니다</p>
          </div>
        ) : (
          filteredTodos.map((todo) => <TodoCard key={todo.todoId} todo={todo} />)
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-white border-t border-border md:max-w-90 md:left-1/2 md:-translate-x-1/2">
        <button
          onClick={() => router.push(`/teams/${teamId}/todos/new`)}
          className="w-full py-3.75 bg-primary text-white text-[15px] font-semibold rounded-[14px] shadow-[0_4px_18px_rgba(91,79,207,0.22)] transition-all duration-200 hover:bg-primary-hover"
        >
          할 일 추가
        </button>
      </div>
    </div>
  )
}
