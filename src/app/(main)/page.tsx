'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ChatBot } from '@/components/ChatBot'
import { BlobAvatar } from '@/components/ui/BlobAvatar'
import { parseAchievementCount } from '@/lib/formatters'
import { getTeams } from '@/services/teamService'
import { getTodayTodos } from '@/services/todoService'
import { useAuth } from '@/store/authStore'
import type { TeamListItem } from '@/types/team.types'
import { TodoStatusBadge } from '@/components/ui/TodoStatusBadge'
import type { Todo } from '@/types/todo.types'

function getCompletionExpression(pct: number): number {
  if (pct === 100) return 1 // grin
  if (pct >= 75) return 0 // happy
  if (pct >= 50) return 4 // calm
  if (pct >= 25) return 2 // surprised
  return 3 // shy
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
      {/* Top row: Team + Status + Time */}
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

      {/* Title */}
      <p className="text-[17px] font-black leading-snug" style={{ color: palette.text }}>
        {todo.title}
      </p>

      {/* Progress */}
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

  const [todos, setTodos] = useState<TodoWithTeam[]>([])
  const [teamList, setTeamList] = useState<TeamListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tab, setTab] = useState<TabType>('all')

  useEffect(() => {
    if (!token) return

    async function load() {
      try {
        const { teams } = await getTeams(token!)
        setTeamList(teams)
        if (teams.length === 0) {
          setTodos([])
          return
        }

        const results = await Promise.allSettled(
          teams.map((team) =>
            getTodayTodos(team.teamId, token!).then((teamTodos) =>
              teamTodos
                .filter((t) => t.myStatus !== null)
                .map((t) => ({ ...t, teamId: team.teamId, teamName: team.teamName }))
            )
          )
        )

        const merged = results
          .filter((r): r is PromiseFulfilledResult<TodoWithTeam[]> => r.status === 'fulfilled')
          .flatMap((r) => r.value)

        merged.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        setTodos(merged)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [token])

  const today = new Date()
  const dayNum = String(today.getDate()).padStart(2, '0')
  const monthNum = String(today.getMonth() + 1).padStart(2, '0')
  const monthEn = MONTHS_EN[today.getMonth()]
  const dayEn = DAYS_EN[today.getDay()]

  const completeCount = todos.filter((t) => t.myStatus === '완료').length
  const incompleteCount = todos.filter((t) => t.myStatus === '미완료').length

  const completionPct = todos.length > 0 ? Math.round((completeCount / todos.length) * 100) : 0
  const mascotExpr = getCompletionExpression(completionPct)
  const speechMsg = getCompletionMessage(completionPct, todos.length)

  const STATUS_ORDER: Record<string, number> = { IN_PROGRESS: 0, SUCCESS: 1, FAIL: 2 }

  const filteredTodos = todos
    .filter((t) => {
      if (tab === 'complete') return t.myStatus === '완료'
      if (tab === 'incomplete') return t.myStatus === '미완료'
      return true
    })
    .sort((a, b) => (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0))

  const TAB_ITEMS: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: todos.length },
    { key: 'incomplete', label: 'Pending', count: incompleteCount },
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
        {/* Big date header */}
        <div className="px-6 pt-6 pb-4 shrink-0 relative">
          <p className="text-[13px] font-semibold text-gray-400 mb-1 tracking-wide">{dayEn}</p>
          <div className="flex items-end gap-0 leading-none">
            <span className="text-[80px] font-black text-gray-900 tracking-tighter leading-none">
              {monthNum}.{dayNum}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[28px] font-black text-gray-900">{monthEn}</p>
            {todos.length > 0 && (
              <p className="text-[13px] font-semibold text-gray-400">
                <span className="font-black text-gray-900">{completeCount}</span>/{todos.length}{' '}
                done
              </p>
            )}
          </div>
          <p className="text-[13px] font-semibold text-gray-400 mt-2 tracking-wide">
            Today&apos;s tasks
          </p>

          {/* Mascot + speech bubble */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="relative bg-white rounded-xl px-3 py-1.5 shadow-sm border border-gray-100">
              <p className="text-[11px] font-bold text-gray-700 whitespace-nowrap">{speechMsg}</p>
              {/* Tail pointing right toward character */}
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

        {/* Todo cards */}
        <div className="flex-1 overflow-y-auto px-4 pb-20 flex flex-col gap-3">
          {todos.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-20">
              <div className="animate-blob-float mb-1">
                <BlobAvatar seed="empty-home" size={72} expressionOverride={3} />
              </div>
              <p className="text-[15px] font-bold text-gray-900">No tasks for today</p>
              <p className="text-[13px] text-gray-400">Create a task in your team</p>
              <button
                onClick={() => router.push('/teams')}
                className="mt-4 px-6 py-2.5 bg-gray-900 text-white text-[14px] font-semibold rounded-xl transition-all duration-200 active:scale-95 hover:opacity-85"
              >
                My Teams
              </button>
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
