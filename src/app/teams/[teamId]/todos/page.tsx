'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { useTeamTodos } from '@/hooks/useTeamTodos'
import { getTeamById } from '@/services/teamService'
import { useAuth } from '@/store/authStore'
import { TeamTodoCard } from './components/TeamTodoCard'
import { TeamHiveGrowthCard } from '@/app/teams/[teamId]/components/TeamHiveGrowthCard'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/PageLoader'
import type { TeamTodoTabType } from '@/hooks/useTeamTodos'

const TAB_LABELS: { key: TeamTodoTabType; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'incomplete', label: '미완료' },
  { key: 'complete', label: '완료' },
]

function TodoListContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const teamId = Number(params.teamId)
  const { token } = useAuth()

  // 팀 홈이 된 화면이므로 어느 팀인지 항상 보여준다
  const [teamName, setTeamName] = useState('')
  useEffect(() => {
    if (!token || Number.isNaN(teamId)) return
    let cancelled = false
    getTeamById(teamId, token)
      .then((team) => {
        if (!cancelled) setTeamName(team.teamName)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [token, teamId])

  const {
    displayTodos,
    isLoading,
    tab,
    setTab,
    showToast,
    filteredTodos,
    completeCount,
    incompleteCount,
  } = useTeamTodos(teamId, token, searchParams.get('created') === '1')

  if (isLoading && displayTodos.length === 0) return <PageLoader />

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-fade-up bg-white">
      <div className="relative shrink-0">
        <div className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-gray-100">
          <BackButton onClick={() => router.push('/teams')} />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-primary tracking-wide truncate">할 일</p>
            <div className="flex items-baseline gap-2">
              <span className="text-[22px] font-black text-gray-900 tracking-tight leading-tight truncate">
                {teamName}
              </span>
              {displayTodos.length > 0 && (
                <span className="shrink-0 text-[12px] font-semibold text-gray-400">
                  <span className="font-black text-gray-900">{completeCount}</span>/
                  {displayTodos.length} 완료
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1 self-start shrink-0">
            <div className="flex items-center gap-0.5">
              <button
                aria-label="팀원들과 가능한 시간 투표로 정하기"
                onClick={() => router.push(`/teams/${teamId}/availability`)}
                className="flex items-center gap-1.5 h-10 pl-2.5 pr-3 rounded-full bg-primary/10 text-primary hover:bg-primary/15 active:scale-95 transition-all"
              >
                <svg
                  className="w-4.5 h-4.5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.9}
                >
                  <circle cx="12" cy="12" r="9" />
                  <path strokeLinecap="round" d="M12 7v5l3.5 2" />
                </svg>
                <span className="text-[12px] font-bold whitespace-nowrap">시간 정하기</span>
              </button>
              <button
                aria-label="팀 설정"
                onClick={() => router.push(`/teams/${teamId}/settings`)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 active:scale-95 transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.9}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.34 4.1c.42-1.75 2.9-1.75 3.32 0a1.71 1.71 0 0 0 2.55 1.06c1.54-.94 3.3.82 2.37 2.37a1.71 1.71 0 0 0 1.05 2.54c1.76.42 1.76 2.91 0 3.33a1.71 1.71 0 0 0-1.05 2.54c.93 1.55-.83 3.31-2.37 2.37a1.71 1.71 0 0 0-2.55 1.06c-.42 1.75-2.9 1.75-3.32 0a1.71 1.71 0 0 0-2.55-1.06c-1.54.94-3.3-.82-2.37-2.37a1.71 1.71 0 0 0-1.05-2.54c-1.76-.42-1.76-2.91 0-3.33a1.71 1.71 0 0 0 1.05-2.54c-.93-1.55.83-3.31 2.37-2.37a1.71 1.71 0 0 0 2.55-1.06Z"
                  />
                  <circle cx="12" cy="12" r="2.6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4 flex flex-col">
        <TeamHiveGrowthCard teamId={teamId} token={token} />

        <div className="flex gap-1.5 px-5 py-3 shrink-0">
          {TAB_LABELS.map(({ key, label }) => {
            const count =
              key === 'all'
                ? displayTodos.length
                : key === 'complete'
                  ? completeCount
                  : incompleteCount
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all duration-150 ${tab === key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                {label} {count}
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-3 px-5 pb-4">
          {displayTodos.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20">
              <svg
                className="w-10 h-10 text-gray-300 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <path strokeLinecap="round" d="M8 8h8M8 12h8M8 16h5" />
              </svg>
              <p className="text-[15px] font-bold text-gray-900">오늘 할 일이 없어요</p>
              <p className="text-[13px] text-gray-400 mt-1">팀의 첫 번째 할 일을 추가해보세요</p>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-[14px] text-gray-400">해당하는 할 일이 없어요</p>
            </div>
          ) : (
            filteredTodos.map((todo, idx) => (
              <TeamTodoCard
                key={todo.todoId}
                todo={todo}
                colorIndex={idx}
                onClick={() => router.push(`/teams/${teamId}/todos/${todo.todoId}`)}
              />
            ))
          )}
        </div>
      </div>

      <div className="shrink-0 px-5 py-4 border-t border-gray-100">
        <Button
          size="lg"
          className="rounded-[18px] font-bold active:scale-[0.98]"
          onClick={() => router.push(`/teams/${teamId}/todos/new`)}
        >
          + 할 일 추가
        </Button>
      </div>

      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-sm bg-ink text-white text-[13px] font-bold text-center py-3.5 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.2)] animate-fade-up z-50">
          할 일이 추가되었습니다
        </div>
      )}
    </div>
  )
}

export default function TodoListPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <TodoListContent />
    </Suspense>
  )
}
