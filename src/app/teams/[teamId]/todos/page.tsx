'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { parseAchievementCount } from '@/lib/formatters'
import { ApiError } from '@/lib/apiClient'
import { useVoice } from '@/hooks/useVoice'
import { getDailyEvaluation } from '@/services/teamService'
import { getTodayTodos } from '@/services/todoService'
import { useAuth } from '@/store/authStore'
import type { DailyEvaluationResponse } from '@/types/team.types'
import { TodoStatusBadge } from '@/components/ui/TodoStatusBadge'
import { AngelBlob, DevilBlob } from '@/components/ui/BlobCharacter'
import { BlobAvatar } from '@/components/ui/BlobAvatar'
import type { Todo } from '@/types/todo.types'

type TabType = 'all' | 'incomplete' | 'complete'

const CARD_PALETTES = [
  {
    bg: 'linear-gradient(135deg,#FFCDC8 0%,#FFDBD7 45%,#FFE8E5 100%)',
    accent: '#C83030',
    text: '#6A1010',
    badge: 'rgba(255,255,255,0.75)',
  },
  {
    bg: 'linear-gradient(135deg,#FFD6E8 0%,#FFE4F0 45%,#FFF0F7 100%)',
    accent: '#B83078',
    text: '#6A0840',
    badge: 'rgba(255,255,255,0.75)',
  },
  {
    bg: 'linear-gradient(135deg,#C8F0D0 0%,#D8F5DC 45%,#EAFAEC 100%)',
    accent: '#208840',
    text: '#0A3818',
    badge: 'rgba(255,255,255,0.75)',
  },
  {
    bg: 'linear-gradient(135deg,#C8E4FF 0%,#D8EDFF 45%,#EBF5FF 100%)',
    accent: '#1A68C8',
    text: '#0A2858',
    badge: 'rgba(255,255,255,0.75)',
  },
  {
    bg: 'linear-gradient(135deg,#FFF0B3 0%,#FFF5CC 45%,#FFFAE5 100%)',
    accent: '#A87800',
    text: '#3A2800',
    badge: 'rgba(255,255,255,0.75)',
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

function formatEvalDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const m = MONTHS_EN[d.getMonth()]
  return `${m} ${d.getDate()} evaluation`
}

function AiEvaluationCard({
  evaluation,
}: {
  evaluation: DailyEvaluationResponse | 'error' | 'loading'
}) {
  const voice = useVoice()

  if (evaluation === 'loading') {
    return (
      <div className="mx-5 mb-4 rounded-2xl bg-gray-50 px-4 py-3 flex items-center justify-center h-14">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  if (evaluation === 'error') {
    return (
      <div className="mx-5 mb-4 rounded-2xl bg-gray-50 px-4 py-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-[18px] leading-none">✨</span>
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-bold text-gray-900">AI evaluation pending</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Complete today&apos;s tasks to get feedback
          </p>
        </div>
      </div>
    )
  }

  const isDevil = evaluation.persona === 'DEVIL'
  const persona = isDevil ? 'DEVIL' : 'ANGEL'
  const isVoicePlaying = voice.isPlaying && voice.activePersona === persona

  return (
    <div
      className="mx-5 mb-4 rounded-2xl overflow-hidden"
      style={{
        background: isDevil ? 'linear-gradient(135deg, #1A0610 0%, #3A0A28 100%)' : '#F5F5F5',
      }}
    >
      <div className="flex items-center gap-3 px-4 pt-3 pb-2.5">
        <div className="shrink-0 animate-blob-float">
          {isDevil ? <DevilBlob size={48} /> : <AngelBlob size={48} />}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-[13px] font-black leading-tight ${isDevil ? 'text-white' : 'text-gray-900'}`}
          >
            {isDevil ? 'Devil AI 👹' : 'Angel AI 🌸'}
          </p>
          <p
            className={`text-[10px] font-semibold mt-0.5 ${isDevil ? 'text-[#FFAAC8]' : 'text-gray-400'}`}
          >
            {formatEvalDate(evaluation.date)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => voice.toggle({ persona, text: evaluation.message })}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 active:scale-90 shrink-0"
          style={{
            background: isVoicePlaying
              ? isDevil
                ? 'rgba(255,255,255,0.2)'
                : '#111'
              : isDevil
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(0,0,0,0.07)',
            color: isDevil ? 'white' : isVoicePlaying ? 'white' : '#111',
          }}
          aria-label={isVoicePlaying ? 'stop' : 'play'}
        >
          {voice.isLoading && voice.activePersona === persona ? (
            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isVoicePlaying ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <rect x="1" y="1" width="3" height="8" rx="1" />
              <rect x="6" y="1" width="3" height="8" rx="1" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M2 1.5l7 3.5-7 3.5V1.5z" />
            </svg>
          )}
        </button>
      </div>
      <div className={`mx-4 h-px ${isDevil ? 'bg-white/10' : 'bg-gray-200'}`} />
      <div className="px-4 pt-2.5 pb-4">
        <p
          className={`text-[12px] leading-relaxed line-clamp-4 ${isDevil ? 'text-white/80' : 'text-gray-600'}`}
        >
          {evaluation.message}
        </p>
      </div>
    </div>
  )
}

function TeamTodoCard({
  todo,
  colorIndex,
  onClick,
}: {
  todo: Todo
  colorIndex: number
  onClick: () => void
}) {
  const { achieved, total } = parseAchievementCount(todo.achievementCount)
  const percentage = total > 0 ? Math.round((achieved / total) * 100) : 0
  const myStatus = todo.myStatus
  const palette = CARD_PALETTES[colorIndex % CARD_PALETTES.length]
  const time = formatTime(todo.deadline)
  const isDone = myStatus === '완료' || todo.status === 'FAIL'

  return (
    <div
      onClick={onClick}
      className={`rounded-[22px] px-5 py-5 flex flex-col gap-3 cursor-pointer transition-all duration-150 active:scale-[0.99] ${isDone ? 'opacity-50' : ''}`}
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
      {/* Top: status badges + time */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <TodoStatusBadge status={todo.status} />
          {myStatus && (
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
              style={{ background: myStatus === '완료' ? palette.accent : 'rgba(0,0,0,0.18)' }}
            >
              {myStatus === '완료' ? 'Done' : 'Pending'}
            </span>
          )}
        </div>
        {time && (
          <span
            className="text-[14px] font-black tracking-tight shrink-0"
            style={{ color: palette.accent }}
          >
            ~{time}
          </span>
        )}
      </div>

      {/* Title */}
      <p className="text-[17px] font-black leading-snug" style={{ color: palette.text }}>
        {todo.title}
      </p>

      {/* Creator */}
      <p className="text-[11px] font-semibold -mt-1" style={{ color: palette.text, opacity: 0.5 }}>
        by {todo.creatorNickname}
      </p>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold" style={{ color: palette.text, opacity: 0.6 }}>
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

function TodoListContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const teamId = Number(params.teamId)
  const { token } = useAuth()

  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<TabType>('all')
  const [showToast, setShowToast] = useState(() => searchParams.get('created') === '1')
  const [aiEvaluation, setAiEvaluation] = useState<DailyEvaluationResponse | 'error' | 'loading'>(
    'loading'
  )

  useEffect(() => {
    if (!showToast) return
    router.replace(`/teams/${teamId}/todos`)
    const t = setTimeout(() => setShowToast(false), 3000)
    return () => clearTimeout(t)
  }, [showToast, router, teamId])

  useEffect(() => {
    if (!token || !teamId) return
    getTodayTodos(teamId, token)
      .then((res) => setTodos(res))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load tasks.')
      })
      .finally(() => setIsLoading(false))
  }, [token, teamId])

  useEffect(() => {
    if (!token || !teamId) return
    getDailyEvaluation(teamId, token)
      .then((res) => setAiEvaluation(res))
      .catch(() => setAiEvaluation('error'))
  }, [token, teamId])

  const today = new Date()
  const dayNum = String(today.getDate()).padStart(2, '0')
  const monthNum = String(today.getMonth() + 1).padStart(2, '0')
  const monthEn = MONTHS_EN[today.getMonth()]
  const dayEn = DAYS_EN[today.getDay()]

  const STATUS_ORDER: Record<string, number> = { IN_PROGRESS: 0, SUCCESS: 1, FAIL: 2 }

  const filteredTodos = todos
    .filter((t) => {
      if (tab === 'complete') return t.status === 'SUCCESS'
      if (tab === 'incomplete') return t.status !== 'SUCCESS'
      return true
    })
    .sort((a, b) => (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0))

  const completeCount = todos.filter((t) => t.status === 'SUCCESS').length
  const incompleteCount = todos.filter((t) => t.status !== 'SUCCESS').length

  const TAB_ITEMS: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: todos.length },
    { key: 'incomplete', label: 'Pending', count: incompleteCount },
    { key: 'complete', label: 'Done', count: completeCount },
  ]

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-[3px] border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-fade-up">
      {/* Big date header */}
      <div className="px-6 pt-5 pb-3 shrink-0">
        <button
          onClick={() => router.back()}
          className="text-[13px] font-semibold text-gray-400 mb-3 flex items-center gap-1 hover:text-gray-700 transition-colors"
        >
          ← Back
        </button>
        <p className="text-[13px] font-semibold text-gray-400 mb-1 tracking-wide">{dayEn}</p>
        <div className="flex items-end gap-0 leading-none">
          <span className="text-[72px] font-black text-gray-900 tracking-tighter leading-none">
            {monthNum}.{dayNum}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[24px] font-black text-gray-900">{monthEn}</p>
          {todos.length > 0 && (
            <p className="text-[13px] font-semibold text-gray-400">
              <span className="font-black text-gray-900">{completeCount}</span>/{todos.length} done
            </p>
          )}
        </div>
        <p className="text-[13px] font-semibold text-gray-400 mt-1.5 tracking-wide">
          Team&apos;s tasks
        </p>
      </div>

      {/* AI Evaluation Card */}
      <AiEvaluationCard evaluation={aiEvaluation} />

      {/* Pill tabs */}
      <div className="flex gap-1.5 px-5 pb-3 shrink-0">
        {TAB_ITEMS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all duration-150 ${
              tab === key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {label} {count}
          </button>
        ))}
      </div>

      {/* Cards scroll */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-3">
        {error || todos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="animate-blob-float mb-3">
              <BlobAvatar seed="empty-team-todos" size={72} expressionOverride={3} />
            </div>
            <p className="text-[15px] font-bold text-gray-900">No tasks today</p>
            <p className="text-[13px] text-gray-400 mt-1">Create the first task for your team</p>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-[14px] text-gray-400">No matching tasks</p>
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

      {/* Add Task footer */}
      <div className="shrink-0 px-5 py-4 border-t border-gray-100">
        <button
          onClick={() => router.push(`/teams/${teamId}/todos/new`)}
          className="w-full py-4 bg-gray-900 text-white text-[15px] font-bold rounded-[18px] transition-all duration-200 hover:opacity-85 active:scale-[0.98] shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
        >
          + Add Task
        </button>
      </div>

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
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center overflow-hidden bg-white">
          <div className="w-8 h-8 border-[3px] border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
      }
    >
      <TodoListContent />
    </Suspense>
  )
}
