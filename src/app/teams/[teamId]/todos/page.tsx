'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useTeamTodos } from '@/hooks/useTeamTodos'
import { useAuth } from '@/store/authStore'
import { MONTHS_KO, DAYS_KO, pad } from '@/lib/dateUtils'
import { Calendar } from '@/components/ui/Calendar'
import { AiEvaluationCard } from './components/AiEvaluationCard'
import { TeamTodoCard } from './components/TeamTodoCard'
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

  const {
    displayTodos,
    isLoading,
    tab,
    setTab,
    showToast,
    aiEvaluation,
    calendarOpen,
    setCalendarOpen,
    selectedDate,
    calendarYear,
    setCalendarYear,
    calendarMonth,
    setCalendarMonth,
    dailyCounts,
    isToday,
    filteredTodos,
    completeCount,
    incompleteCount,
    handleSelectDate,
    handlePrevMonth,
    handleNextMonth,
  } = useTeamTodos(teamId, token, searchParams.get('created') === '1')

  const selectedDateObj = new Date(selectedDate + 'T00:00:00')
  const dayNum = pad(selectedDateObj.getDate())
  const monthNum = pad(selectedDateObj.getMonth() + 1)
  const monthKo = MONTHS_KO[selectedDateObj.getMonth()]
  const dayKo = DAYS_KO[selectedDateObj.getDay()]

  if (isLoading && displayTodos.length === 0) return <PageLoader />

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-fade-up bg-white">
      <div className="relative shrink-0">
        <div className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-gray-100">
          <BackButton onClick={() => router.back()} />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-gray-400 tracking-wide">{dayKo}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-[26px] font-black text-gray-900 tracking-tight leading-tight">
                {monthNum}.{dayNum} {monthKo}
              </span>
              {displayTodos.length > 0 && (
                <span className="text-[12px] font-semibold text-gray-400">
                  <span className="font-black text-gray-900">{completeCount}</span>/
                  {displayTodos.length} 완료
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[11px] font-semibold text-gray-400 flex-1">
                {isToday
                  ? '오늘의 할 일'
                  : `${selectedDateObj.getFullYear()}년 ${String(selectedDateObj.getMonth() + 1)}월 ${selectedDateObj.getDate()}일`}
              </p>
              <button
                onClick={() => {
                  setCalendarOpen((prev) => !prev)
                  if (!calendarOpen) {
                    setCalendarYear(selectedDateObj.getFullYear())
                    setCalendarMonth(selectedDateObj.getMonth() + 1)
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all duration-200 ${calendarOpen ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
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
                  onSelectDate={handleSelectDate}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {isToday && <AiEvaluationCard evaluation={aiEvaluation} />}

      <div className="flex-1 overflow-y-auto pb-4 flex flex-col">
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
                className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all duration-150 ${tab === key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
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
              <p className="text-[15px] font-bold text-gray-900">
                {isToday ? '오늘 할 일이 없어요' : '이 날 할 일이 없어요'}
              </p>
              <p className="text-[13px] text-gray-400 mt-1">
                {isToday ? '팀의 첫 번째 할 일을 추가해보세요' : '다른 날짜를 선택해보세요'}
              </p>
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
                onClick={() =>
                  router.push(
                    `/teams/${teamId}/todos/${todo.todoId}?myStatus=${encodeURIComponent(todo.myStatus ?? '')}`
                  )
                }
              />
            ))
          )}
        </div>
      </div>

      {isToday && (
        <div className="shrink-0 px-5 py-4 border-t border-gray-100">
          <Button
            size="lg"
            className="rounded-[18px] font-bold shadow-[0_8px_32px_rgba(0,0,0,0.18)] active:scale-[0.98]"
            onClick={() => router.push(`/teams/${teamId}/todos/new`)}
          >
            + 할 일 추가
          </Button>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-sm bg-gray-900 text-white text-[13px] font-bold text-center py-3.5 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.2)] animate-fade-up z-50">
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
