import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getDailyEvaluation } from '@/services/teamService'
import { getHistoryTodos, getTeamTodoReport } from '@/services/todoService'
import { pad } from '@/lib/dateUtils'
import type { DailyEvaluationResponse } from '@/types/team.types'
import type { Todo } from '@/types/todo.types'

export type TeamTodoTabType = 'all' | 'incomplete' | 'complete'

const STATUS_ORDER: Record<string, number> = { IN_PROGRESS: 0, SUCCESS: 1, FAIL: 2 }

export function useTeamTodos(teamId: number, token: string | null, initialShowToast = false) {
  const router = useRouter()

  const todayStr = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }, [])

  const [displayTodos, setDisplayTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tab, setTab] = useState<TeamTodoTabType>('all')
  const [showToast, setShowToast] = useState(initialShowToast)
  const [aiEvaluation, setAiEvaluation] = useState<DailyEvaluationResponse | 'error' | 'loading'>(
    'loading'
  )

  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear())
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth() + 1)
  const [dailyCounts, setDailyCounts] = useState<Record<string, number>>({})

  const isToday = selectedDate === todayStr

  useEffect(() => {
    if (!showToast) return
    router.replace(`/teams/${teamId}/todos`)
    const t = setTimeout(() => setShowToast(false), 3000)
    return () => clearTimeout(t)
  }, [showToast, router, teamId])

  useEffect(() => {
    if (!token || !teamId) return
    async function load() {
      setIsLoading(true)
      try {
        const data = await getHistoryTodos(teamId, selectedDate, token!)
        setDisplayTodos(data)
      } catch {
        setDisplayTodos([])
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [selectedDate, teamId, token])

  useEffect(() => {
    if (!token || !teamId) return
    getDailyEvaluation(teamId, token)
      .then((res) => setAiEvaluation(res))
      .catch(() => setAiEvaluation('error'))
  }, [token, teamId])

  useEffect(() => {
    if (!calendarOpen || !token || !teamId) return
    const startDate = `${calendarYear}-${pad(calendarMonth)}-01`
    const lastDay = new Date(calendarYear, calendarMonth, 0).getDate()
    const endDate = `${calendarYear}-${pad(calendarMonth)}-${pad(lastDay)}`
    getTeamTodoReport(teamId, startDate, endDate, token)
      .then((report) => {
        const counts: Record<string, number> = {}
        for (const stat of report?.dailyStats ?? []) {
          if (stat.totalTodoCount > 0) counts[stat.date] = stat.totalTodoCount
        }
        setDailyCounts(counts)
      })
      .catch(() => {})
  }, [calendarOpen, calendarYear, calendarMonth, teamId, token])

  function handleSelectDate(date: string) {
    setSelectedDate(date)
    setTab('all')
    setCalendarOpen(false)
  }

  function handlePrevMonth() {
    if (calendarMonth === 1) {
      setCalendarYear((y) => y - 1)
      setCalendarMonth(12)
    } else setCalendarMonth((m) => m - 1)
  }

  function handleNextMonth() {
    if (calendarMonth === 12) {
      setCalendarYear((y) => y + 1)
      setCalendarMonth(1)
    } else setCalendarMonth((m) => m + 1)
  }

  const filteredTodos = displayTodos
    .filter((t) => {
      if (tab === 'complete') return t.status === 'SUCCESS'
      if (tab === 'incomplete') return t.status !== 'SUCCESS'
      return true
    })
    .sort((a, b) => (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0))

  const completeCount = displayTodos.filter((t) => t.status === 'SUCCESS').length
  const incompleteCount = displayTodos.filter((t) => t.status !== 'SUCCESS').length

  return {
    todayStr,
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
  }
}
