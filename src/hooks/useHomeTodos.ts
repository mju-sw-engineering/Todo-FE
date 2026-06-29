'use client'

import { useEffect, useMemo, useState } from 'react'
import { getHistoryTodos, getTeamTodoReport } from '@/services/todoService'
import { pad } from '@/lib/dateUtils'
import type { TeamListItem } from '@/types/team.types'
import type { TodoWithTeam } from '@/types/todo.types'

export function useHomeTodos(token: string | null, teamList: TeamListItem[]) {
  const todayStr = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }, [])

  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear())
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth() + 1)
  const [dailyCounts, setDailyCounts] = useState<Record<string, number>>({})
  const [historyTodos, setHistoryTodos] = useState<TodoWithTeam[] | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)

  useEffect(() => {
    if (!calendarOpen || !token || teamList.length === 0) return
    const startDate = `${calendarYear}-${pad(calendarMonth)}-01`
    const lastDay = new Date(calendarYear, calendarMonth, 0).getDate()
    const endDate = `${calendarYear}-${pad(calendarMonth)}-${pad(lastDay)}`

    async function loadReport() {
      const results = await Promise.allSettled(
        teamList.map((team) => getTeamTodoReport(team.teamId, startDate, endDate, token!))
      )
      const counts: Record<string, number> = {}
      for (const r of results) {
        if (r.status === 'fulfilled' && Array.isArray(r.value?.dailyStats)) {
          for (const stat of r.value.dailyStats) {
            counts[stat.date] = (counts[stat.date] ?? 0) + stat.totalTodoCount
          }
        }
      }
      setDailyCounts(counts)
    }
    loadReport()
  }, [calendarOpen, calendarYear, calendarMonth, teamList, token])

  useEffect(() => {
    if (!token || teamList.length === 0) return

    async function loadHistory() {
      setHistoryLoading(true)
      setHistoryError(null)
      try {
        const results = await Promise.allSettled(
          teamList.map((team) =>
            getHistoryTodos(team.teamId, selectedDate, token!).then((todos) =>
              todos
                .filter((t) => t.myStatus !== null)
                .map(
                  (t): TodoWithTeam => ({
                    ...t,
                    teamId: team.teamId,
                    teamName: team.teamName,
                    teamImageUrl: team.teamImageUrl ?? null,
                  })
                )
            )
          )
        )
        const merged = results
          .filter((r): r is PromiseFulfilledResult<TodoWithTeam[]> => r.status === 'fulfilled')
          .flatMap((r) => r.value)
        merged.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        setHistoryTodos(merged)
      } catch {
        setHistoryError('데이터를 불러올 수 없습니다')
      } finally {
        setHistoryLoading(false)
      }
    }
    loadHistory()
  }, [selectedDate, teamList, token])

  function handleSelectDate(date: string) {
    if (date === selectedDate) return
    setSelectedDate(date)
  }

  function handlePrevMonth() {
    if (calendarMonth === 1) {
      setCalendarYear((y) => y - 1)
      setCalendarMonth(12)
    } else {
      setCalendarMonth((m) => m - 1)
    }
  }

  function handleNextMonth() {
    if (calendarMonth === 12) {
      setCalendarYear((y) => y + 1)
      setCalendarMonth(1)
    } else {
      setCalendarMonth((m) => m + 1)
    }
  }

  return {
    todayStr,
    selectedDate,
    setSelectedDate,
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
    isToday: selectedDate === todayStr,
  }
}
