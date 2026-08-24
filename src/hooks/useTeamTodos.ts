import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getTeamTodoReport, getTodosByDate } from '@/services/todoService'
import { addDays, pad, startOfWeekMonday, todayString } from '@/lib/dateUtils'
import type { DayStat, Todo } from '@/types/todo.types'

export type TeamTodoTabType = 'all' | 'incomplete' | 'complete'

/**
 * 카드가 받을 표현 등급.
 * - `done` 완료 · `overdue` 마감 지났는데 미완료
 * - `hero` 지금 시각 기준 다음 마감 (날짜당 최대 한 장)
 * - `upcoming` 그 뒤로 남은 것
 */
export type TeamTodoVariant = 'done' | 'overdue' | 'hero' | 'upcoming'

export interface ClassifiedTodo {
  todo: Todo
  variant: TeamTodoVariant
}

/** 마감이 1분 단위라 남은 시간 표시와 hero 이동에는 이 주기면 충분하다 */
const NOW_TICK_MS = 60_000

function monthRangeCoveringWeeks(year: number, month: number): { start: string; end: string } {
  const lastDay = new Date(year, month, 0).getDate()
  return {
    start: startOfWeekMonday(`${year}-${pad(month)}-01`),
    end: addDays(startOfWeekMonday(`${year}-${pad(month)}-${pad(lastDay)}`), 6),
  }
}

/**
 * 같은 날짜 안에서는 BE가 이미 deadline 오름차순으로 주므로 순서를 건드리지 않는다.
 * 지난 마감을 아래로 밀지 않는 것도 의도된 것 — 놓친 일이 먼저 보여야 한다.
 */
function classify(todos: Todo[], now: number): ClassifiedTodo[] {
  let heroTaken = false
  return todos.map((todo) => {
    if (todo.status === 'SUCCESS') return { todo, variant: 'done' as const }
    if (new Date(todo.deadline).getTime() <= now) return { todo, variant: 'overdue' as const }
    if (!heroTaken) {
      heroTaken = true
      return { todo, variant: 'hero' as const }
    }
    return { todo, variant: 'upcoming' as const }
  })
}

export function useTeamTodos(teamId: number, token: string | null, initialShowToast = false) {
  const router = useRouter()

  const todayStr = useMemo(() => todayString(), [])

  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [todos, setTodos] = useState<Todo[]>([])
  // 로딩은 별도 상태가 아니라 "요청한 날짜"와 "받아온 날짜"의 차이로 본다.
  // 이펙트 본문에서 동기적으로 setState 하지 않아 연쇄 렌더가 생기지 않는다.
  const [loadedDate, setLoadedDate] = useState<string | null>(null)
  const [tab, setTab] = useState<TeamTodoTabType>('all')
  const [showToast, setShowToast] = useState(initialShowToast)
  const [now, setNow] = useState(() => Date.now())

  const [calendarOpen, setCalendarOpen] = useState(false)
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear())
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth() + 1)
  const [dayStats, setDayStats] = useState<Record<string, DayStat>>({})

  /** 날짜 전환 슬라이드 방향. +1이면 미래로, -1이면 과거로 */
  const [direction, setDirection] = useState(0)
  const prevDateRef = useRef(selectedDate)

  const isToday = selectedDate === todayStr
  // teamId가 NaN이면 조회 이펙트가 그대로 빠져나가 loadedDate가 영영 갱신되지 않는다.
  // 로딩으로 두면 잘못된 URL에서 PageLoader가 무한히 남는다.
  const hasValidTeam = Number.isInteger(teamId) && teamId > 0
  const isLoading = hasValidTeam && loadedDate !== selectedDate

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), NOW_TICK_MS)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!showToast) return
    router.replace(`/teams/${teamId}/todos`)
    const t = setTimeout(() => setShowToast(false), 3000)
    return () => clearTimeout(t)
  }, [showToast, router, teamId])

  // 선택한 날짜의 할 일. 캐시가 살아있으면 즉시 반환돼 날짜를 넘길 때 깜빡이지 않는다.
  useEffect(() => {
    if (!token || Number.isNaN(teamId)) return
    let cancelled = false
    const requested = selectedDate
    getTodosByDate(teamId, requested, token)
      .then((data) => {
        if (!cancelled) setTodos(data)
      })
      .catch(() => {
        if (!cancelled) setTodos([])
      })
      .finally(() => {
        if (!cancelled) setLoadedDate(requested)
      })
    return () => {
      cancelled = true
    }
  }, [teamId, token, selectedDate])

  // 주간 스트립 점과 월간 캘린더 점이 같은 데이터를 쓴다 — 달 하나를 주 단위로 넉넉히 덮어 한 번만 부른다.
  useEffect(() => {
    if (!token || Number.isNaN(teamId)) return
    let cancelled = false
    const { start, end } = monthRangeCoveringWeeks(calendarYear, calendarMonth)
    getTeamTodoReport(teamId, start, end, token)
      .then((report) => {
        if (cancelled) return
        const next: Record<string, DayStat> = {}
        for (const stat of report?.dailyStats ?? []) {
          if (stat.totalTodoCount > 0) {
            next[stat.date] = { total: stat.totalTodoCount, achievementRate: stat.achievementRate }
          }
        }
        // 이번 응답이 덮는 구간은 통째로 갈아끼운다. 병합만 하면 할 일이 모두 사라진 날의
        // 옛 점이 남아, 지운 뒤 달을 다시 열어도 계속 표시된다.
        setDayStats((prev) => {
          const merged: Record<string, DayStat> = {}
          for (const [date, stat] of Object.entries(prev)) {
            if (date < start || date > end) merged[date] = stat
          }
          return { ...merged, ...next }
        })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [teamId, token, calendarYear, calendarMonth])

  const handleSelectDate = useCallback((date: string) => {
    setDirection(date > prevDateRef.current ? 1 : -1)
    prevDateRef.current = date
    setSelectedDate(date)
    setTab('all')
    setCalendarOpen(false)
    // 다른 달을 고르면 통계 조회 구간도 따라간다
    const [y, m] = date.split('-').map(Number)
    setCalendarYear(y)
    setCalendarMonth(m)
  }, [])

  const handlePrevMonth = useCallback(() => {
    if (calendarMonth === 1) {
      setCalendarYear(calendarYear - 1)
      setCalendarMonth(12)
    } else {
      setCalendarMonth(calendarMonth - 1)
    }
  }, [calendarMonth, calendarYear])

  const handleNextMonth = useCallback(() => {
    if (calendarMonth === 12) {
      setCalendarYear(calendarYear + 1)
      setCalendarMonth(1)
    } else {
      setCalendarMonth(calendarMonth + 1)
    }
  }, [calendarMonth, calendarYear])

  const classified = useMemo(() => classify(todos, now), [todos, now])

  const filteredTodos = useMemo(() => {
    if (tab === 'complete') return classified.filter((c) => c.variant === 'done')
    if (tab === 'incomplete') return classified.filter((c) => c.variant !== 'done')
    return classified
  }, [classified, tab])

  const completeCount = classified.filter((c) => c.variant === 'done').length
  const overdueCount = classified.filter((c) => c.variant === 'overdue').length
  const incompleteCount = todos.length - completeCount

  return {
    hasValidTeam,
    todayStr,
    selectedDate,
    todos,
    isLoading,
    tab,
    setTab,
    showToast,
    direction,
    calendarOpen,
    setCalendarOpen,
    calendarYear,
    calendarMonth,
    dayStats,
    isToday,
    now,
    filteredTodos,
    completeCount,
    incompleteCount,
    overdueCount,
    handleSelectDate,
    handlePrevMonth,
    handleNextMonth,
  }
}
