'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ChatBot } from '@/components/ChatBot'
import { formatDate, formatDeadline, parseAchievementCount } from '@/lib/formatters'
import { getTeams } from '@/services/teamService'
import { getTodayTodos } from '@/services/todoService'
import { useAuth } from '@/store/authStore'
import type { TeamListItem } from '@/types/team.types'
import { TodoStatusBadge } from '@/components/ui/TodoStatusBadge'
import type { MyTodoStatus, Todo } from '@/types/todo.types'

type TabType = 'all' | 'incomplete' | 'complete'

interface TodoWithTeam extends Todo {
  teamId: number
  teamName: string
}

const MY_STATUS_STYLE: Record<MyTodoStatus, string> = {
  완료: 'text-white',
  미완료: 'bg-gray-100 text-gray-400',
}

function MyTodoCard({ todo, onClick }: { todo: TodoWithTeam; onClick: () => void }) {
  const { achieved, total } = parseAchievementCount(todo.achievementCount)
  const percentage = total > 0 ? Math.round((achieved / total) * 100) : 0
  const myStatus = todo.myStatus

  return (
    <div
      onClick={onClick}
      className={`rounded-[20px] border border-border bg-white px-5 py-4 flex flex-col gap-3 cursor-pointer transition-all duration-150 hover:shadow-[0_4px_20px_rgba(208,91,142,0.12)] hover:border-primary/20 active:scale-[0.99] ${myStatus === '완료' || todo.status === 'FAIL' ? 'opacity-55' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full truncate max-w-30">
              {todo.teamName}
            </span>
            <TodoStatusBadge status={todo.status} />
          </div>
          <p className="text-[15px] font-semibold text-ink leading-snug">{todo.title}</p>
          <p className="text-[12px] text-muted mt-0.5">{formatDeadline(todo.deadline)} 마감</p>
        </div>
        {myStatus && (
          <span
            className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full mt-0.5 ${MY_STATUS_STYLE[myStatus]}`}
            style={
              myStatus === '완료'
                ? { background: 'linear-gradient(135deg, #D05B8E, #FF8C7A)' }
                : undefined
            }
          >
            {myStatus}
          </span>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] text-muted">
            {achieved}/{total}명 인증
          </span>
          <span className="text-[12px] font-semibold text-primary">{percentage}%</span>
        </div>
        <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percentage}%`,
              background:
                myStatus === '완료'
                  ? 'linear-gradient(90deg, #D05B8E, #FF8C7A)'
                  : 'linear-gradient(90deg, #F5E0EC, #E0B8CC)',
            }}
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
  const [teamList, setTeamList] = useState<TeamListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tab, setTab] = useState<TabType>('all')

  useEffect(() => {
    if (!token) return

    async function load() {
      try {
        const { teams } = await getTeams(token!)
        setTeamList(teams)
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

  const STATUS_ORDER: Record<string, number> = { IN_PROGRESS: 0, SUCCESS: 1, FAIL: 2 }

  const filteredTodos = todos
    .filter((t) => {
      if (tab === 'complete') return t.myStatus === '완료'
      if (tab === 'incomplete') return t.myStatus === '미완료'
      return true
    })
    .sort((a, b) => (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0))

  const completeCount = todos.filter((t) => t.myStatus === '완료').length
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
    <>
      <div className="flex-1 flex flex-col min-h-0 bg-surface animate-fade-up">
        {/* 헤더 — 그라데이션 */}
        <div
          className="px-5 pt-8 pb-5 shrink-0"
          style={{ background: 'linear-gradient(160deg, #FFF0F6 0%, #FFF8F2 60%, #F5FBFF 100%)' }}
        >
          <p className="text-[13px] font-medium text-muted mb-0.5">{formatDate(today)} 오늘</p>
          <h1 className="text-[28px] font-black text-ink tracking-tight">내 할 일 ✅</h1>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-border px-5 bg-white">
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
              {label}{' '}
              <span className={`text-[12px] ${tab === key ? 'text-primary' : 'text-muted'}`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* 할일 목록 */}
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-20 flex flex-col gap-3">
          {todos.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-20">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-1 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #FFF0F6, #FFE0EC)' }}
              >
                <span className="text-3xl">📋</span>
              </div>
              <p className="text-[15px] font-bold text-ink">오늘 할당된 할 일이 없습니다</p>
              <p className="text-[13px] text-muted">팀에서 할 일을 생성해보세요</p>
              <button
                onClick={() => router.push('/teams')}
                className="mt-4 px-6 py-2.5 text-white text-[14px] font-semibold rounded-xl transition-all duration-200 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #D05B8E 0%, #FF8C7A 100%)',
                  boxShadow: '0 4px 18px rgba(208,91,142,0.30)',
                }}
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
      {token && <ChatBot token={token} teams={teamList} />}
    </>
  )
}
