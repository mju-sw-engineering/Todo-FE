'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Calendar } from '@/components/ui/Calendar'
import { BeeCharacter, expressionForProgress } from '@/components/bee/BeeCharacter'
import { MyTodoCard } from './components/MyTodoCard'
import { getTeams } from '@/services/teamService'
import { useAuth } from '@/store/authStore'
import { useHomeTodos } from '@/hooks/useHomeTodos'
import { MONTHS_EN, DAYS_KO, pad } from '@/lib/dateUtils'
import { Spinner } from '@/components/ui/Spinner'
import type { TeamListItem } from '@/types/team.types'
import { isMyWorkComplete } from '@/types/todo.types'

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
  const dayKo = DAYS_KO[selectedDateObj.getDay()]

  const completeCount = displayTodos.filter((todo) => isMyWorkComplete(todo.myWorkSummary)).length
  const remainingCount = displayTodos.length - completeCount
  const completionPct =
    displayTodos.length > 0 ? Math.round((completeCount / displayTodos.length) * 100) : 0
  const speechMsg = getCompletionMessage(completionPct, displayTodos.length)

  const STATUS_ORDER: Record<string, number> = { IN_PROGRESS: 0, SUCCESS: 1, FAIL: 2 }
  const filteredTodos = displayTodos
    .filter((t) => {
      if (tab === 'complete') return isMyWorkComplete(t.myWorkSummary)
      if (tab === 'incomplete') return !isMyWorkComplete(t.myWorkSummary)
      return true
    })
    .sort((a, b) => (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0))

  const TAB_ITEMS: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: '전체', count: displayTodos.length },
    {
      key: 'incomplete',
      label: '미완료',
      count: displayTodos.filter((t) => !isMyWorkComplete(t.myWorkSummary)).length,
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
          <p className="text-[13px] font-semibold text-gray-400 mb-1 tracking-wide">{dayKo}</p>
          {/* 날짜 자체가 달력 토글 — 별도 달력 버튼을 없애 UI를 줄인다 */}
          <button
            onClick={() => {
              setCalendarOpen((prev) => !prev)
              if (!calendarOpen) {
                setCalendarYear(selectedDateObj.getFullYear())
                setCalendarMonth(selectedDateObj.getMonth() + 1)
              }
            }}
            aria-expanded={calendarOpen}
            aria-label="달력 열기"
            className="flex items-end gap-1.5 leading-none active:opacity-70 transition-opacity"
          >
            <span className="text-[76px] font-jua text-gray-900 tracking-tight leading-none">
              {monthNum}.{dayNum}
            </span>
            <svg
              className={`mb-4 w-6 h-6 transition-transform duration-200 ${
                calendarOpen ? 'rotate-180 text-primary' : 'text-gray-300'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {displayTodos.length > 0 && (
            <p className="text-[13px] font-semibold text-gray-400 mt-1">
              <span className="font-black text-gray-900">{remainingCount}</span>개 남음
            </p>
          )}
          <p className="text-[13px] font-semibold text-gray-400 tracking-wide mt-2">
            {isToday
              ? '오늘의 할 일'
              : `${MONTHS_EN[calendarMonth - 1]} ${selectedDateObj.getDate()}, ${calendarYear}`}
          </p>

          {displayTodos.length > 0 && (
            <div className="absolute top-2 right-3 flex flex-col items-center">
              <div className="bee-bob">
                <BeeCharacter
                  expression={expressionForProgress(completionPct, displayTodos.length)}
                  size={104}
                />
              </div>
              <div className="bg-white rounded-xl px-2.5 py-1 shadow-sm border border-gray-100 -mt-1 z-10">
                <p className="text-[11px] font-jua text-gray-700 whitespace-nowrap">{speechMsg}</p>
              </div>
            </div>
          )}
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

      {!historyLoading && !historyError && displayTodos.length > 0 && completionPct === 100 && (
        <div className="mx-4 mb-3 shrink-0 rounded-2xl px-4 py-2.5 flex items-center gap-3 bg-[linear-gradient(135deg,#eef4ff_0%,#dbe9ff_100%)]">
          <BeeCharacter expression="proud" size={56} flip />
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
              tab === key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
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
            <div className="relative mb-1">
              <span className="absolute -top-2 -right-7 text-[14px] font-jua text-[#b7c3d8] tracking-[0.2em] select-none">
                z z
              </span>
              <BeeCharacter expression="proud" size={120} />
            </div>
            {isToday ? (
              <>
                <p className="text-[16px] font-jua text-gray-900">오늘 할 일이 없어요</p>
                <p className="text-[13px] text-gray-400">팀에서 할 일을 추가해보세요</p>
                <button
                  onClick={() => router.push('/teams')}
                  className="mt-4 px-6 py-2.5 bg-primary text-white text-[14px] font-semibold rounded-xl transition-all duration-200 active:scale-95 hover:opacity-85"
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
              onClick={() => router.push(`/teams/${todo.teamId}/todos/${todo.todoId}`)}
            />
          ))
        )}
      </div>
    </div>
  )
}
