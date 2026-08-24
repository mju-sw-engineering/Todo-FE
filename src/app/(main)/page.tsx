'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BeePose } from '@/components/bee/BeePose'
import { MyTodoCard } from './components/MyTodoCard'
import { getTeams } from '@/services/teamService'
import { useAuth } from '@/store/authStore'
import { useHomeTodos } from '@/hooks/useHomeTodos'
import { Spinner } from '@/components/ui/Spinner'
import type { TeamListItem } from '@/types/team.types'
import { isMyWorkComplete } from '@/types/todo.types'

type TabType = 'all' | 'incomplete' | 'complete'

export default function HomePage() {
  const router = useRouter()
  const { token } = useAuth()

  const [teamList, setTeamList] = useState<TeamListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tab, setTab] = useState<TabType>('all')
  const [selectedTeamId, setSelectedTeamId] = useState<number | 'all'>('all')
  const [teamMenuOpen, setTeamMenuOpen] = useState(false)

  const { historyTodos, historyLoading, historyError, reload } = useHomeTodos(token, teamList)

  useEffect(() => {
    if (!token) return
    async function load() {
      try {
        const { teams } = await getTeams(token!)
        setTeamList(teams)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [token])

  const displayTodos = historyTodos ?? []
  const teamScopedTodos =
    selectedTeamId === 'all'
      ? displayTodos
      : displayTodos.filter((t) => t.teamId === selectedTeamId)
  const selectedTeamName =
    selectedTeamId === 'all'
      ? '전체 팀'
      : (teamList.find((t) => t.teamId === selectedTeamId)?.teamName ?? '전체 팀')

  const completeCount = teamScopedTodos.filter((todo) =>
    isMyWorkComplete(todo.myWorkSummary)
  ).length
  const remainingCount = teamScopedTodos.length - completeCount
  const completionPct =
    teamScopedTodos.length > 0 ? Math.round((completeCount / teamScopedTodos.length) * 100) : 0

  const STATUS_ORDER: Record<string, number> = { IN_PROGRESS: 0, SUCCESS: 1, FAIL: 2 }
  const filteredTodos = teamScopedTodos
    .filter((t) => {
      if (tab === 'complete') return isMyWorkComplete(t.myWorkSummary)
      if (tab === 'incomplete') return !isMyWorkComplete(t.myWorkSummary)
      return true
    })
    .sort((a, b) => (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0))

  const TAB_ITEMS: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: '전체', count: teamScopedTodos.length },
    {
      key: 'incomplete',
      label: '미완료',
      count: teamScopedTodos.filter((t) => !isMyWorkComplete(t.myWorkSummary)).length,
    },
    { key: 'complete', label: '완료', count: completeCount },
  ]

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center pb-16">
        <Spinner variant="track" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 animate-fade-up bg-white">
      <div className="shrink-0 relative">
        <div className="px-6 pt-6 pb-4 relative">
          <span className="text-[32px] font-jua text-gray-900 tracking-tight leading-none">
            할 일
          </span>
          <div className="flex items-center gap-2 mt-2">
            {displayTodos.length > 0 && (
              <p className="text-[13px] font-semibold text-gray-400">
                <span className="font-black text-gray-900">{remainingCount}</span>개 남음
              </p>
            )}
            {teamList.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setTeamMenuOpen((v) => !v)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[11.5px] font-bold hover:bg-gray-200 transition-colors"
                >
                  {selectedTeamName}
                  <svg
                    className={`w-3 h-3 transition-transform ${teamMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {teamMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setTeamMenuOpen(false)} />
                    <div className="absolute left-0 top-full mt-1.5 w-40 max-h-64 overflow-y-auto bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-gray-100 z-20">
                      <button
                        onClick={() => {
                          setSelectedTeamId('all')
                          setTeamMenuOpen(false)
                        }}
                        className={`w-full text-left px-3.5 py-2 text-[13px] font-semibold ${
                          selectedTeamId === 'all'
                            ? 'text-primary bg-primary/5'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        전체 팀
                      </button>
                      {teamList.map((team) => (
                        <button
                          key={team.teamId}
                          onClick={() => {
                            setSelectedTeamId(team.teamId)
                            setTeamMenuOpen(false)
                          }}
                          className={`w-full text-left px-3.5 py-2 text-[13px] font-semibold truncate ${
                            selectedTeamId === team.teamId
                              ? 'text-primary bg-primary/5'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {team.teamName}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {!historyLoading && !historyError && displayTodos.length > 0 && completionPct === 100 && (
        <div className="mx-4 mb-3 shrink-0 rounded-2xl px-4 py-2.5 flex items-center gap-3 bg-[linear-gradient(135deg,#eef4ff_0%,#dbe9ff_100%)]">
          <BeePose pose="cheer" size={62} />
          <div>
            <p className="text-[13.5px] font-bold text-ink">오늘 할 일을 모두 끝냈어요</p>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">
              꿀 한 칸 채웠어요 · 내일도 이어가요
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-1 px-5 pb-3 shrink-0">
        {TAB_ITEMS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all duration-150 ${
              tab === key ? 'bg-primary text-white' : 'bg-neutral-30 text-muted hover:bg-neutral-40'
            }`}
          >
            {label} {count}
          </button>
        ))}
      </div>

      <div
        className={`flex-1 px-4 pb-20 flex flex-col gap-3 ${
          !historyLoading && !historyError && filteredTodos.length > 0
            ? 'overflow-y-auto'
            : 'overflow-hidden'
        }`}
      >
        {historyLoading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Spinner variant="track" />
          </div>
        ) : historyError ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-20">
            <p className="text-[14px] font-semibold text-gray-500">{historyError}</p>
            <button
              onClick={reload}
              className="mt-2 px-5 py-2 bg-gray-100 text-gray-700 text-[13px] font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : displayTodos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-20">
            <div className="mb-1">
              <BeePose pose="search" size={130} />
            </div>
            <p className="text-[16px] font-jua text-gray-900">오늘은 남은 일이 없어요</p>
            <p className="text-[13px] text-gray-400">팀에서 할 일을 추가해보세요</p>
            <button
              onClick={() => router.push('/teams')}
              className="mt-4 px-6 py-2.5 bg-primary text-white text-[14px] font-semibold rounded-xl transition-all duration-200 active:scale-95 hover:opacity-85"
            >
              내 팀 보기
            </button>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-[14px] text-gray-400">해당하는 남은 일이 없어요</p>
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <MyTodoCard
              key={`${todo.teamId}-${todo.todoId}`}
              todo={todo}
              onClick={() => router.push(`/teams/${todo.teamId}/todos/${todo.todoId}`)}
            />
          ))
        )}
      </div>
    </div>
  )
}
