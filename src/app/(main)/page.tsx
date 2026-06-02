'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { ChatBot } from '@/components/ChatBot'
import { BlobAvatar } from '@/components/ui/BlobAvatar'
import { Calendar } from '@/components/ui/Calendar'
import { parseAchievementCount } from '@/lib/formatters'
import { getTeams } from '@/services/teamService'
import { getHistoryTodos, getTeamTodoReport } from '@/services/todoService'
import { useAuth } from '@/store/authStore'
import type { TeamListItem } from '@/types/team.types'
import { TodoStatusBadge } from '@/components/ui/TodoStatusBadge'
import type { Todo } from '@/types/todo.types'

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

interface TodoWithTeam extends Todo {
  teamId: number
  teamName: string
}

const CARD_PALETTES = [
  {
    bg: 'linear-gradient(135deg,#FFCDC8 0%,#FFDBD7 45%,#FFE8E5 100%)',
    accent: '#C83030',
    text: '#6A1010',
    badge: 'rgba(255,255,255,0.75)',
    badgeText: '#6A1010',
  },
  {
    bg: 'linear-gradient(135deg,#FFD6E8 0%,#FFE4F0 45%,#FFF0F7 100%)',
    accent: '#B83078',
    text: '#6A0840',
    badge: 'rgba(255,255,255,0.75)',
    badgeText: '#6A0840',
  },
  {
    bg: 'linear-gradient(135deg,#C8F0D0 0%,#D8F5DC 45%,#EAFAEC 100%)',
    accent: '#208840',
    text: '#0A3818',
    badge: 'rgba(255,255,255,0.75)',
    badgeText: '#0A3818',
  },
  {
    bg: 'linear-gradient(135deg,#C8E4FF 0%,#D8EDFF 45%,#EBF5FF 100%)',
    accent: '#1A68C8',
    text: '#0A2858',
    badge: 'rgba(255,255,255,0.75)',
    badgeText: '#0A2858',
  },
  {
    bg: 'linear-gradient(135deg,#FFF0B3 0%,#FFF5CC 45%,#FFFAE5 100%)',
    accent: '#A87800',
    text: '#3A2800',
    badge: 'rgba(255,255,255,0.75)',
    badgeText: '#3A2800',
  },
]

const MONTHS_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

function MyTodoCard({
  todo,
  colorIndex,
  onClick,
}: {
  todo: TodoWithTeam
  colorIndex: number
  onClick: () => void
}) {
  const { achieved, total } = parseAchievementCount(todo.achievementCount)
  const percentage = total > 0 ? Math.round((achieved / total) * 100) : 0
  const myStatus = todo.myStatus
  const palette = CARD_PALETTES[colorIndex % CARD_PALETTES.length]
  const time = formatTime(todo.deadline)
  const dimmed = myStatus === '완료' || todo.status === 'FAIL'

  return (
    <div
      onClick={onClick}
      className={`rounded-[22px] px-5 py-5 flex flex-col gap-3 cursor-pointer transition-all duration-150 active:scale-[0.99] ${dimmed ? 'opacity-50' : ''}`}
      style={{
        background: [
          'radial-gradient(circle at 28% 22%, rgba(255,255,255,0.28) 0%, transparent 52%)',
          'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 38%)',
          palette.bg,
        ].join(', '),
        border: '1px solid rgba(255,255,255,0.55)',
        boxShadow: [
          'inset 0 1.5px 1px rgba(255,255,255,0.95)',
          'inset 0 -1px 0 rgba(0,0,0,0.06)',
          'inset 1px 0 1px rgba(255,255,255,0.45)',
          '0 8px 32px rgba(0,0,0,0.09)',
          '0 2px 6px rgba(0,0,0,0.04)',
        ].join(', '),
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span
            className="text-[11px] font-bold px-2.5 py-1 rounded-full truncate max-w-32"
            style={{ background: palette.badge, color: palette.text }}
          >
            Team {todo.teamName}
          </span>
          <TodoStatusBadge status={todo.status} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {myStatus === '완료' && (
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
              style={{ background: palette.accent }}
            >
              완료
            </span>
          )}
          {time && (
            <span
              className="text-[13px] font-black tracking-tight"
              style={{ color: palette.accent }}
            >
              ~{time}
            </span>
          )}
        </div>
      </div>

      <p className="text-[17px] font-black leading-snug" style={{ color: palette.text }}>
        {todo.title}
      </p>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span
            className="text-[11px] font-semibold"
            style={{ color: palette.text, opacity: 0.65 }}
          >
            {achieved}/{total} certified
          </span>
          <span className="text-[12px] font-black" style={{ color: palette.accent }}>
            {percentage}%
          </span>
        </div>
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.5)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%`, background: palette.accent }}
          />
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const { token } = useAuth()

  const todayStr = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }, [])

  const [teamList, setTeamList] = useState<TeamListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tab, setTab] = useState<TabType>('all')

  // Calendar state
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear())
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth() + 1)
  const [dailyCounts, setDailyCounts] = useState<Record<string, number>>({})
  const [historyTodos, setHistoryTodos] = useState<TodoWithTeam[] | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)

  // Initial load: teams only
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

  // Load monthly report when calendar opens or month changes
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

  // Load todos for selected date via history endpoint
  useEffect(() => {
    if (!token || teamList.length === 0) return

    const date = selectedDate
    const teams = teamList
    const tk = token

    async function loadHistory() {
      setHistoryLoading(true)
      setHistoryError(null)
      try {
        const results = await Promise.allSettled(
          teams.map((team) =>
            getHistoryTodos(team.teamId, date, tk).then((todos) =>
              todos
                .filter((t) => t.myStatus !== null)
                .map((t) => ({ ...t, teamId: team.teamId, teamName: team.teamName }))
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
  }, [selectedDate, teamList, token, todayStr])

  function handleSelectDate(date: string) {
    if (date === selectedDate) return
    setSelectedDate(date)
    setTab('all')
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

  const isToday = selectedDate === todayStr
  const displayTodos = historyTodos ?? []

  // Parse selected date for header display
  const selectedDateObj = new Date(selectedDate + 'T00:00:00')
  const dayNum = pad(selectedDateObj.getDate())
  const monthNum = pad(selectedDateObj.getMonth() + 1)
  const monthEn = MONTHS_EN[selectedDateObj.getMonth()]
  const dayEn = DAYS_EN[selectedDateObj.getDay()]

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
    { key: 'all', label: 'All', count: displayTodos.length },
    {
      key: 'incomplete',
      label: 'Pending',
      count: displayTodos.filter((t) => t.myStatus === '미완료').length,
    },
    { key: 'complete', label: 'Done', count: completeCount },
  ]

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center pb-16">
        <div className="w-8 h-8 border-[3px] border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 flex flex-col min-h-0 animate-fade-up">
        {/* Header + Calendar overlay wrapper */}
        <div className="shrink-0 relative">
          <div className="px-6 pt-6 pb-4 relative">
            <p className="text-[13px] font-semibold text-gray-400 mb-1 tracking-wide">{dayEn}</p>
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
                  {displayTodos.length} done
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-[13px] font-semibold text-gray-400 tracking-wide flex-1">
                {isToday
                  ? "Today's tasks"
                  : `${calendarYear}년 ${calendarMonth}월 ${selectedDateObj.getDate()}일`}
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

            {/* Mascot + speech bubble */}
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

          {/* Calendar floating overlay */}
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

        {/* Tab bar */}
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

        {/* Todo cards / states */}
        <div className="flex-1 overflow-y-auto px-4 pb-20 flex flex-col gap-3">
          {historyLoading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <div className="w-7 h-7 border-[3px] border-gray-300 border-t-gray-900 rounded-full animate-spin" />
            </div>
          ) : historyError ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-20">
              <p className="text-[14px] font-semibold text-gray-500">{historyError}</p>
              <button
                onClick={() => handleSelectDate(selectedDate)}
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
                  <p className="text-[15px] font-bold text-gray-900">No tasks for today</p>
                  <p className="text-[13px] text-gray-400">Create a task in your team</p>
                  <button
                    onClick={() => router.push('/teams')}
                    className="mt-4 px-6 py-2.5 bg-gray-900 text-white text-[14px] font-semibold rounded-xl transition-all duration-200 active:scale-95 hover:opacity-85"
                  >
                    My Teams
                  </button>
                </>
              ) : (
                <p className="text-[14px] font-semibold text-gray-500">등록된 투두가 없습니다</p>
              )}
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-[14px] text-gray-400">No matching tasks</p>
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
