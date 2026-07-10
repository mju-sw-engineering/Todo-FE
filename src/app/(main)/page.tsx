'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ChatBot } from '@/components/ChatBot'
import { BlobAvatar } from '@/components/ui/BlobAvatar'
import { Calendar } from '@/components/ui/Calendar'
import { MyTodoCard } from './components/MyTodoCard'
import { getTeams } from '@/services/teamService'
import { useAuth } from '@/store/authStore'
import { useHomeTodos } from '@/hooks/useHomeTodos'
import { MONTHS_EN, DAYS_KO, pad } from '@/lib/dateUtils'
import { Spinner } from '@/components/ui/Spinner'
import type { TeamListItem } from '@/types/team.types'

function getCompletionExpression(pct: number): number {
  if (pct === 100) return 1
  if (pct >= 75) return 0
  if (pct >= 50) return 4
  if (pct >= 25) return 2
  return 3
}

function getCompletionMessage(pct: number, total: number): string {
  if (total === 0) return '할 일을 추가해봐요!'
  if (pct === 100) return '모두 완료! 완벽해요!'
  if (pct >= 75) return '거의 다 왔어요!'
  if (pct >= 50) return '반 이상 했어요!'
  if (pct >= 25) return '조금씩 해봐요!'
  return '시작이 반이에요!'
}

type TabType = 'all' | 'incomplete' | 'complete'

export default function HomePage() {
  const router = useRouter()
  const { token } = useAuth()

  const [teamList, setTeamList] = useState<TeamListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tab, setTab] = useState<TabType>('all')

  const {
    todayStr,
    selectedDate,
    calendarOpen,
    setCalendarOpen,
    calendarYear,
    setCalendarYear,
    calendarMonth,
    setCalendarMonth,
    dailyCounts,
    historyTodos,
    historyLoading,
    historyError,
    handleSelectDate,
    handlePrevMonth,
    handleNextMonth,
    isToday,
  } = useHomeTodos(token, teamList)

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
  const selectedDateObj = new Date(selectedDate + 'T00:00:00')
  const dayNum = pad(selectedDateObj.getDate())
  const monthNum = pad(selectedDateObj.getMonth() + 1)
  const monthEn = MONTHS_EN[selectedDateObj.getMonth()]
  const dayKo = DAYS_KO[selectedDateObj.getDay()]

  const completeCount = displayTodos.filter((t) => t.myStatus === '완료').length
  const completionPct =
    displayTodos.length > 0 ? Math.round((completeCount / displayTodos.length) * 100) : 0
  const mascotExpr = getCompletionExpression(completionPct)
  const speechMsg = getCompletionMessage(completionPct, displayTodos.length)

  const STATUS_ORDER: Record<string, number> = { IN_PROGRESS: 0, SUCCESS: 1, FAIL: 2 }
  const filteredTodos = displayTodos
    .filter((t) => {
      if (tab === 'complete') return t.myStatus === '완료'
      if (tab === 'incomplete') return t.myStatus === '미완료'
      return true
    })
    .sort((a, b) => (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0))

  const TAB_ITEMS: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: '전체', count: displayTodos.length },
    {
      key: 'incomplete',
      label: '미완료',
      count: displayTodos.filter((t) => t.myStatus === '미완료').length,
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
    <>
      <div className="flex-1 flex flex-col min-h-0 animate-fade-up bg-white">
        <div className="shrink-0 relative">
          <div className="px-6 pt-6 pb-4 relative">
            <p className="text-[13px] font-semibold text-gray-400 mb-1 tracking-wide">{dayKo}</p>
            <div className="flex items-end gap-0 leading-none">
              <span className="text-[80px] font-black text-gray-900 tracking-tighter leading-none">
                {monthNum}.{dayNum}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[28px] font-black text-gray-900">{monthEn}</p>
              {displayTodos.length > 0 && (
                <p className="text-[13px] font-semibold text-gray-400">
                  <span className="font-black text-gray-900">{completeCount}</span>/
                  {displayTodos.length} 완료
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-[13px] font-semibold text-gray-400 tracking-wide flex-1">
                {isToday
                  ? '오늘의 할 일'
                  : `${MONTHS_EN[calendarMonth - 1]} ${selectedDateObj.getDate()}, ${calendarYear}`}
              </p>
              <button
                onClick={() => {
                  setCalendarOpen((prev) => !prev)
                  if (!calendarOpen) {
                    setCalendarYear(selectedDateObj.getFullYear())
                    setCalendarMonth(selectedDateObj.getMonth() + 1)
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all duration-200 ${
                  calendarOpen
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                달력
              </button>
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-2">
              <div className="relative bg-white rounded-xl px-3 py-1.5 shadow-sm border border-gray-100">
                <p className="text-[11px] font-bold text-gray-700 whitespace-nowrap">{speechMsg}</p>
                <svg
                  className="absolute top-1/2 -right-2 -translate-y-1/2"
                  width="8"
                  height="12"
                  viewBox="0 0 8 12"
                  fill="none"
                >
                  <path d="M0 0 L0 12 L8 6 Z" fill="white" />
                  <path d="M0 0.5 L7.5 6" stroke="rgba(0,0,0,0.07)" strokeWidth="0.7" />
                  <path d="M0 11.5 L7.5 6" stroke="rgba(0,0,0,0.07)" strokeWidth="0.7" />
                </svg>
              </div>
              <div className="animate-blob-float shrink-0">
                <BlobAvatar seed="home-mascot" size={52} expressionOverride={mascotExpr} />
              </div>
            </div>
          </div>

          {calendarOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setCalendarOpen(false)} />
              <div
                className="absolute top-full left-0 right-0 z-30 px-4 pt-1 pb-3"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="shadow-[0_8px_32px_rgba(0,0,0,0.13)] rounded-[18px]">
                  <Calendar
                    selectedDate={selectedDate}
                    year={calendarYear}
                    month={calendarMonth}
                    dailyCounts={dailyCounts}
                    onSelectDate={(date) => {
                      handleSelectDate(date)
                      setTab('all')
                      setCalendarOpen(false)
                    }}
                    onPrevMonth={handlePrevMonth}
                    onNextMonth={handleNextMonth}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-1 px-5 pb-3 shrink-0">
          {TAB_ITEMS.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all duration-150 ${
                tab === key
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
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
                onClick={() => handleSelectDate(todayStr)}
                className="mt-2 px-5 py-2 bg-gray-100 text-gray-700 text-[13px] font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                다시 시도
              </button>
            </div>
          ) : displayTodos.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-20">
              <div className="animate-blob-float mb-1">
                <BlobAvatar seed="empty-home" size={72} expressionOverride={3} />
              </div>
              {isToday ? (
                <>
                  <p className="text-[15px] font-bold text-gray-900">오늘 할 일이 없어요</p>
                  <p className="text-[13px] text-gray-400">팀에서 할 일을 추가해보세요</p>
                  <button
                    onClick={() => router.push('/teams')}
                    className="mt-4 px-6 py-2.5 bg-gray-900 text-white text-[14px] font-semibold rounded-xl transition-all duration-200 active:scale-95 hover:opacity-85"
                  >
                    내 팀 보기
                  </button>
                </>
              ) : (
                <p className="text-[14px] font-semibold text-gray-500">등록된 투두가 없습니다</p>
              )}
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-[14px] text-gray-400">해당하는 할 일이 없어요</p>
            </div>
          ) : (
            filteredTodos.map((todo, idx) => (
              <MyTodoCard
                key={`${todo.teamId}-${todo.todoId}`}
                todo={todo}
                colorIndex={idx}
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
