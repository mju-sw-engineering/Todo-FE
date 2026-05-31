'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { AVATAR_COLORS, getInitials } from '@/lib/formatters'
import { ApiError } from '@/lib/apiClient'
import { getTeamById } from '@/services/teamService'
import { createTodo } from '@/services/todoService'
import { useAuth } from '@/store/authStore'
import type { TeamMember } from '@/types/team.types'

function toIsoDeadline(timeValue: string): string {
  const [hours, minutes] = timeValue.split(':').map(Number)
  const d = new Date()
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

function formatDisplayTime(value: string): string {
  if (!value) return ''
  const [h, m] = value.split(':').map(Number)
  const label = h < 12 ? '오전' : '오후'
  const hour = h % 12 || 12
  return `${label} ${hour}:${m.toString().padStart(2, '0')}`
}

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

function TimePicker({
  value,
  onChange,
  onClose,
}: {
  value: string
  onChange: (v: string) => void
  onClose: () => void
}) {
  const now = new Date()
  const nowH = now.getHours()
  const nowM = now.getMinutes()

  // Default: next hour rounded up, or current + 5min
  function defaultTime() {
    const nextM = Math.ceil((nowM + 5) / 5) * 5
    if (nextM >= 60) {
      const h = nowH + 1 >= 24 ? 23 : nowH + 1
      return { h, m: 0 }
    }
    return { h: nowH, m: nextM }
  }

  const init = value
    ? { h: Number(value.split(':')[0]), m: Number(value.split(':')[1]) }
    : defaultTime()

  const [ampm, setAmpm] = useState<'AM' | 'PM'>(init.h >= 12 ? 'PM' : 'AM')
  const [hour, setHour] = useState(init.h % 12 || 12)
  const [minute, setMinute] = useState(
    MINUTES.includes(init.m) ? init.m : (MINUTES.find((m) => m >= init.m) ?? 0)
  )

  function get24H(h: number, ap: 'AM' | 'PM') {
    return (h % 12) + (ap === 'PM' ? 12 : 0)
  }

  function isHourDisabled(h: number, ap: 'AM' | 'PM') {
    // Disabled if even the last minute (55) of that hour is <= now
    return get24H(h, ap) * 60 + 55 <= nowH * 60 + nowM
  }

  function isMinuteDisabled(m: number) {
    return get24H(hour, ampm) * 60 + m <= nowH * 60 + nowM
  }

  function handleAmpm(ap: 'AM' | 'PM') {
    setAmpm(ap)
    // Auto-advance hour if all minutes in current hour are past
    const newH24 = get24H(hour, ap)
    const hasValidMinute = MINUTES.some((m) => newH24 * 60 + m > nowH * 60 + nowM)
    if (!hasValidMinute) {
      // Find next valid hour in new period
      const validHour = HOURS.find((h) => !isHourDisabled(h, ap))
      if (validHour) {
        setHour(validHour)
        const firstValidMin =
          MINUTES.find((m) => get24H(validHour, ap) * 60 + m > nowH * 60 + nowM) ?? 0
        setMinute(firstValidMin)
      }
    } else {
      const firstValidMin = MINUTES.find((m) => newH24 * 60 + m > nowH * 60 + nowM)
      if (firstValidMin !== undefined && isMinuteDisabled(minute)) setMinute(firstValidMin)
    }
  }

  function handleHour(h: number) {
    setHour(h)
    const h24 = get24H(h, ampm)
    const firstValidMin = MINUTES.find((m) => h24 * 60 + m > nowH * 60 + nowM)
    if (firstValidMin !== undefined && h24 * 60 + minute <= nowH * 60 + nowM) {
      setMinute(firstValidMin)
    }
  }

  function confirm() {
    const h = get24H(hour, ampm)
    if (h * 60 + minute <= nowH * 60 + nowM) return
    onChange(`${h.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
    onClose()
  }

  const confirmDisabled = get24H(hour, ampm) * 60 + minute <= nowH * 60 + nowM

  return createPortal(
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 320, mass: 0.8 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0, bottom: 0.3 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 80 || info.velocity.y > 400) onClose()
        }}
        className="fixed bottom-0 left-0 right-0 z-50 max-w-97.5 mx-auto bg-white rounded-t-3xl px-5 pt-4 pb-10 cursor-grab active:cursor-grabbing"
      >
        <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5" />
        <h3 className="text-[16px] font-bold text-ink mb-5">마감 시간 선택</h3>

        {/* 오전 / 오후 */}
        <div className="flex bg-surface rounded-[14px] p-1 mb-5">
          {(['AM', 'PM'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handleAmpm(p)}
              className={`flex-1 py-2.5 rounded-[11px] text-[14px] font-semibold transition-all duration-200 ${
                ampm === p ? 'bg-white text-gray-900 shadow-sm' : 'text-muted'
              }`}
            >
              {p === 'AM' ? '오전' : '오후'}
            </button>
          ))}
        </div>

        {/* 시 */}
        <p className="text-[11px] font-semibold text-muted tracking-wider mb-2">시</p>
        <div className="grid grid-cols-6 gap-1.5 mb-5">
          {HOURS.map((h) => {
            const disabled = isHourDisabled(h, ampm)
            return (
              <button
                key={h}
                type="button"
                onClick={() => !disabled && handleHour(h)}
                disabled={disabled}
                className={`py-2.5 rounded-[10px] text-[14px] font-semibold transition-all duration-150 ${
                  hour === h && !disabled
                    ? 'bg-gray-900 text-white'
                    : disabled
                      ? 'bg-surface text-muted/40 cursor-not-allowed line-through'
                      : 'bg-surface text-ink hover:bg-gray-100'
                }`}
              >
                {h}
              </button>
            )
          })}
        </div>

        {/* 분 */}
        <p className="text-[11px] font-semibold text-muted tracking-wider mb-2">분</p>
        <div className="grid grid-cols-6 gap-1.5 mb-6">
          {MINUTES.map((m) => {
            const disabled = isMinuteDisabled(m)
            return (
              <button
                key={m}
                type="button"
                onClick={() => !disabled && setMinute(m)}
                disabled={disabled}
                className={`py-2.5 rounded-[10px] text-[14px] font-semibold transition-all duration-150 ${
                  minute === m && !disabled
                    ? 'bg-gray-900 text-white'
                    : disabled
                      ? 'bg-surface text-muted/40 cursor-not-allowed line-through'
                      : 'bg-surface text-ink hover:bg-gray-100'
                }`}
              >
                {m.toString().padStart(2, '0')}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={confirm}
          disabled={confirmDisabled}
          className="w-full py-4 bg-gray-900 text-white text-[15px] font-semibold rounded-[14px] transition-all duration-200 hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          확인
        </button>
      </motion.div>
    </>,
    document.body
  )
}

export default function TodoNewPage() {
  const router = useRouter()
  const params = useParams()
  const teamId = Number(params.teamId)
  const { token } = useAuth()

  const [members, setMembers] = useState<TeamMember[]>([])
  const [isMembersLoading, setIsMembersLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const [description, setDescription] = useState('')
  const [excludedIds, setExcludedIds] = useState<Set<number>>(new Set())
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)

  useEffect(() => {
    if (!token || !teamId) return
    getTeamById(teamId, token)
      .then((team) => setMembers(team.members))
      .catch(() => setError('팀원 목록을 불러오지 못했습니다.'))
      .finally(() => setIsMembersLoading(false))
  }, [token, teamId])

  function toggleExclude(userId: number) {
    setExcludedIds((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })
  }

  async function handleSubmit() {
    setError('')
    if (!title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }
    if (!deadline) {
      setError('마감 시간을 입력해주세요.')
      return
    }
    if (!token) {
      setError('로그인이 필요합니다.')
      return
    }

    const assigneeIds = members.filter((m) => !excludedIds.has(m.userId)).map((m) => m.userId)
    if (assigneeIds.length === 0) {
      setError('최소 한 명의 팀원을 포함해야 합니다.')
      return
    }

    setIsLoading(true)
    try {
      await createTodo(
        teamId,
        {
          title: title.trim(),
          deadline: toIsoDeadline(deadline),
          description: description.trim() || undefined,
          assigneeIds,
        },
        token
      )
      router.push(`/teams/${teamId}/todos?created=1`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '할 일 생성 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-fade-up">
      {/* 헤더 (스크롤 고정) */}
      <div className="px-6 pt-8 pb-2">
        <button
          onClick={() => router.back()}
          className="text-[13px] font-semibold text-muted mb-6 flex items-center gap-1 hover:text-gray-700 transition-colors"
        >
          ← 뒤로
        </button>
        <h1 className="text-[22px] font-bold text-ink">할 일 만들기</h1>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-[13px] font-semibold text-gray-700 tracking-wide">
            제목
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (error) setError('')
            }}
            placeholder="할 일 제목을 입력해주세요"
            className="w-full px-4 py-3.25 rounded-[14px] border-[1.5px] border-border bg-white text-[14px] text-ink placeholder:text-muted placeholder:font-light outline-none transition-all duration-200 focus:border-gray-900 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-semibold text-gray-700 tracking-wide">마감 시간</p>
          <button
            type="button"
            onClick={() => {
              setShowTimePicker(true)
              if (error) setError('')
            }}
            className={`w-full px-4 py-3.25 rounded-[14px] border-[1.5px] text-[14px] text-left transition-all duration-200 ${
              deadline
                ? 'border-gray-900 bg-white text-ink font-medium'
                : 'border-border bg-white text-muted font-light'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{deadline ? formatDisplayTime(deadline) : '시간을 선택해주세요'}</span>
              <svg
                className="w-4 h-4 text-muted shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="description"
            className="text-[13px] font-semibold text-gray-700 tracking-wide"
          >
            설명
            <span className="ml-1 text-[12px] font-normal text-muted">(선택)</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="할 일에 대한 설명을 입력해주세요"
            rows={3}
            className="w-full px-4 py-3.25 rounded-[14px] border-[1.5px] border-border bg-white text-[14px] text-ink placeholder:text-muted placeholder:font-light outline-none transition-all duration-200 focus:border-gray-900 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)] resize-none"
          />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[13px] font-semibold text-gray-700 tracking-wide">팀원</p>
          {isMembersLoading ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {members.map((member, idx) => {
                const isExcluded = excludedIds.has(member.userId)
                const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length]
                return (
                  <li
                    key={member.userId}
                    className={`flex items-center justify-between bg-white rounded-[14px] border border-border px-4 py-3.5 transition-all duration-200 ${
                      isExcluded ? 'opacity-40' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${avatarColor}`}
                      >
                        {getInitials(member.nickname)}
                      </div>
                      <span className="text-[14px] font-medium text-ink">{member.nickname}</span>
                    </div>
                    {isExcluded ? (
                      <button
                        onClick={() => toggleExclude(member.userId)}
                        className="text-[13px] font-semibold text-muted"
                      >
                        제외됨
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleExclude(member.userId)}
                        className="px-4 py-1.5 rounded-[10px] border border-border text-[13px] font-semibold text-ink transition-all duration-200 hover:border-gray-900 hover:text-gray-900"
                      >
                        제외
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {error && (
          <p className="text-[13px] text-red-400 bg-red-50 rounded-[10px] px-4 py-2.5">{error}</p>
        )}
      </div>

      {/* 바텀 버튼 (항상 고정) */}
      <div className="px-6 py-5 border-t border-border flex flex-col gap-3">
        <button
          onClick={handleSubmit}
          disabled={isLoading || isMembersLoading}
          className="w-full py-3.75 bg-gray-900 text-white text-[15px] font-semibold rounded-[14px] transition-all duration-200 hover:opacity-85 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {isLoading ? '생성 중...' : '생성하기'}
        </button>
        <button
          onClick={() => router.back()}
          className="w-full py-3.75 bg-gray-100 text-gray-700 text-[15px] font-semibold rounded-[14px] transition-all duration-200 hover:bg-gray-200"
        >
          돌아가기
        </button>
      </div>

      <AnimatePresence>
        {showTimePicker && (
          <TimePicker
            value={deadline}
            onChange={(v) => {
              setDeadline(v)
              if (error) setError('')
            }}
            onClose={() => setShowTimePicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
