'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTeamTodos } from '@/hooks/useTeamTodos'
import { getTeamById } from '@/services/teamService'
import { useAuth } from '@/store/authStore'
import { TeamTodoCard } from './components/TeamTodoCard'
import { WeekStrip } from './components/WeekStrip'
import { TeamMenuSheet } from './components/TeamMenuSheet'
import { TeamMenuHint, markTeamMenuHintSeen } from './components/TeamMenuHint'
import { AddTodoCard } from './components/AddTodoCard'
import { TeamHiveGrowthCard } from '@/app/teams/[teamId]/components/TeamHiveGrowthCard'
import { BackButton } from '@/components/ui/BackButton'
import { Calendar } from '@/components/ui/Calendar'
import { PageLoader } from '@/components/ui/PageLoader'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
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
  const reduceMotion = useReducedMotion()

  const [menuOpen, setMenuOpen] = useState(false)

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
    hasValidTeam,
    todayStr,
    selectedDate,
    todos,
    isLoading,
    tab,
    setTab,
    direction,
    calendarOpen,
    setCalendarOpen,
    calendarYear,
    calendarMonth,
    dayStats,
    now,
    filteredTodos,
    completeCount,
    incompleteCount,
    overdueCount,
    handleSelectDate,
    handlePrevMonth,
    handleNextMonth,
  } = useTeamTodos(teamId, token, searchParams.get('created') === '1')

  const slideX = reduceMotion ? 0 : 24

  if (!hasValidTeam) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 bg-white">
        <p className="text-[15px] font-bold text-ink">팀을 찾을 수 없어요</p>
        <Button variant="outline" onClick={() => router.push('/teams')}>
          팀 목록으로
        </Button>
      </div>
    )
  }

  if (isLoading && todos.length === 0 && selectedDate === todayStr) return <PageLoader />

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-fade-up bg-white">
      {/* 힌트 말풍선이 헤더 밖으로 나와 아래 스크롤 영역 위에 떠야 해서 쌓임 순서를 올려둔다 */}
      <div className="relative z-20 shrink-0 bg-white">
        <div className="px-5 pt-4 pb-3 flex items-center gap-2 border-b border-border">
          <BackButton onClick={() => router.push('/teams')} />
          <div className="flex-1 min-w-0">
            <span className="text-[22px] font-black text-ink tracking-tight leading-tight truncate block">
              {teamName}
            </span>
          </div>
          <div className="relative shrink-0">
            <button
              aria-label="팀 메뉴 열기"
              aria-expanded={menuOpen}
              onClick={() => {
                markTeamMenuHintSeen()
                setMenuOpen(true)
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full text-muted hover:bg-neutral-30 active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="1.7" />
                <circle cx="12" cy="12" r="1.7" />
                <circle cx="19" cy="12" r="1.7" />
              </svg>
            </button>
            <TeamMenuHint suppressed={menuOpen} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4 flex flex-col">
        <TeamHiveGrowthCard teamId={teamId} token={token} compact />

        <WeekStrip
          selectedDate={selectedDate}
          todayStr={todayStr}
          dayStats={dayStats}
          calendarOpen={calendarOpen}
          onSelectDate={handleSelectDate}
          onToggleCalendar={() => setCalendarOpen(!calendarOpen)}
        />

        <AnimatePresence initial={false}>
          {calendarOpen && (
            <motion.div
              key="calendar"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden px-5 shrink-0"
            >
              <div className="pt-1 pb-2">
                <Calendar
                  selectedDate={selectedDate}
                  year={calendarYear}
                  month={calendarMonth}
                  dayStats={dayStats}
                  allowFuture
                  onSelectDate={handleSelectDate}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-1.5 px-5 py-2.5 shrink-0">
          {TAB_LABELS.map(({ key, label }) => {
            const count =
              key === 'all' ? todos.length : key === 'complete' ? completeCount : incompleteCount
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all duration-150 ${
                  tab === key
                    ? 'bg-primary text-white'
                    : 'bg-neutral-30 text-muted hover:bg-neutral-40'
                }`}
              >
                {label} {count}
              </button>
            )
          })}
          {overdueCount > 0 && (
            <span className="ml-auto text-[11.5px] font-bold text-status-red bg-status-red/10 px-2.5 py-1 rounded-full whitespace-nowrap">
              지난 마감 {overdueCount}
            </span>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0, x: direction * slideX }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -slideX }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col gap-2.5 px-5 pb-4"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner />
              </div>
            ) : todos.length === 0 ? (
              <div className="flex flex-col items-center justify-center pt-16 pb-8">
                <svg
                  className="w-10 h-10 text-neutral-50 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <rect x="4" y="3" width="16" height="18" rx="2" />
                  <path strokeLinecap="round" d="M8 8h8M8 12h8M8 16h5" />
                </svg>
                <p className="text-[15px] font-bold text-ink">이 날은 마감인 할 일이 없어요</p>
                <p className="text-[13px] text-muted mt-1">위에서 다른 날짜를 골라볼 수 있어요</p>
                <div className="w-full mt-6">
                  <AddTodoCard onClick={() => router.push(`/teams/${teamId}/todos/new`)} />
                </div>
              </div>
            ) : filteredTodos.length === 0 ? (
              <div className="flex items-center justify-center pt-16 pb-8">
                <p className="text-[14px] text-muted">해당하는 할 일이 없어요</p>
              </div>
            ) : (
              filteredTodos.map(({ todo, variant }) => (
                <TeamTodoCard
                  key={todo.todoId}
                  todo={todo}
                  variant={variant}
                  now={now}
                  onClick={() => router.push(`/teams/${teamId}/todos/${todo.todoId}`)}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {menuOpen && <TeamMenuSheet teamId={teamId} onClose={() => setMenuOpen(false)} />}
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
