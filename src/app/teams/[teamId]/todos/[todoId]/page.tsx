'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import { AVATAR_COLORS, formatDeadline, getInitials, parseAchievementCount } from '@/lib/formatters'
import { ApiError } from '@/lib/apiClient'
import { getTodoDetail, postReaction } from '@/services/todoService'
import { useAuth } from '@/store/authStore'
import { TodoStatusBadge } from '@/components/ui/TodoStatusBadge'
import type { MyTodoStatus, ReactionType, TodoDetail, TodoParticipant } from '@/types/todo.types'

const PROGRESS_MESSAGES = {
  none: ['아직 아무도 안됐어요 ㅠ', '다들 뭐하는 거예요? 😴', '누가 먼저 할까요? 🫠'],
  one: ['첫 번째 용사 등장! 🙌', '드디어 한 명! 🎉', '스타트를 끊었어요 🏃'],
  few: (n: number) => [`${n}명 완료! 화이팅 🔥`, `${n}명이나 했어요! 💪`, '점점 달아오르는 중! 🌡️'],
  half: ['절반 넘었어요! 🚀', '중반 돌파! 👏', '반이나 됐어요 ✨'],
  most: ['거의 다 왔어요! 😤', '마지막 한 명만! 🎯', '조금만 더! ⚡'],
  all: ['전원 완료! 🎊', '모두 다 했어요! 🏆', '완벽한 팀이에요! ✨'],
}

function getProgressMessage(achieved: number, total: number, seed: number): string {
  const pick = (arr: string[]) => arr[seed % arr.length]
  if (total === 0) return ''
  if (achieved === 0) return pick(PROGRESS_MESSAGES.none)
  if (achieved === total) return pick(PROGRESS_MESSAGES.all)
  const ratio = achieved / total
  if (ratio >= 0.8) return pick(PROGRESS_MESSAGES.most)
  if (ratio > 0.5) return pick(PROGRESS_MESSAGES.half)
  if (achieved === 1) return pick(PROGRESS_MESSAGES.one)
  return pick(PROGRESS_MESSAGES.few(achieved))
}

const CERT_BADGE_LABEL: Record<MyTodoStatus, string> = {
  완료: '완료',
  미완료: '미완료',
}

const CERT_BADGE_STYLE: Record<MyTodoStatus, string> = {
  완료: 'bg-primary text-white',
  미완료: 'bg-gray-100 text-gray-400',
}

function MemberCertCard({
  member,
  index,
  isCurrentUser,
  onCertify,
  onReact,
}: {
  member: TodoParticipant
  index: number
  isCurrentUser: boolean
  onCertify: () => void
  onReact: (type: ReactionType) => void
}) {
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length]
  const status = member.status
  const isCompleted = status === '완료'
  const canCertify = isCurrentUser && status === '미완료'
  const canReact = !isCurrentUser && isCompleted

  const activeReactions = (member.reactions ?? []).filter((r) => r.count > 0)
  const totalCount = activeReactions.reduce((s, r) => s + r.count, 0)
  const myReactionEmoji = member.reactions?.find((r) => r.type === member.myReaction)?.emoji

  return (
    <div
      className={`rounded-[18px] overflow-hidden border border-border ${canCertify ? 'cursor-pointer active:scale-[0.99] transition-transform' : ''}`}
      onClick={() => {
        if (canCertify) onCertify()
        if (showPicker) setShowPicker(false)
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 bg-white">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${avatarColor}`}
          >
            {getInitials(member.nickname)}
          </div>
          <span className="text-[14px] font-semibold text-ink">{member.nickname}</span>
        </div>
        {status && (
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${CERT_BADGE_STYLE[status] ?? 'bg-gray-100 text-gray-400'}`}
          >
            {CERT_BADGE_LABEL[status] ?? status}
          </span>
        )}
      </div>

      {/* Photo area */}
      <div className="relative w-full h-44">
        {isCompleted && member.proofImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.proofImageUrl}
            alt="인증샷"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : isCompleted ? (
          <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-primary/40" />
        ) : canCertify ? (
          <div className="absolute inset-0 bg-primary-light flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center">
              <span className="text-[22px] font-light text-primary/60 leading-none">+</span>
            </div>
            <span className="text-[12px] text-primary/50">탭해서 인증하기</span>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gray-50" />
        )}

        {/* Facebook-style reaction summary (bottom-left) */}
        {activeReactions.length > 0 && (
          <div className="absolute bottom-2.5 left-3 flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-2 py-0.5">
            <div className="flex -space-x-0.5">
              {activeReactions.slice(0, 3).map((r) => (
                <span key={r.type} className="text-[13px] leading-none drop-shadow-sm">
                  {r.emoji}
                </span>
              ))}
            </div>
            {totalCount > 0 && (
              <span className="text-[11px] font-semibold text-white leading-none">
                {totalCount}
              </span>
            )}
          </div>
        )}

        {/* Heart button + emoji picker (bottom-right) */}
        {canReact && (
          <div
            ref={pickerRef}
            className="absolute bottom-2.5 right-3 flex flex-col items-end gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Emoji picker pill */}
            <AnimatePresence>
              {showPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: 6 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 380, mass: 0.5 }}
                  className="flex items-center gap-0.5 bg-white/95 backdrop-blur-md rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.18)] px-2 py-1.5"
                >
                  {(member.reactions ?? []).map((r) => {
                    const isSelected = member.myReaction === r.type
                    return (
                      <button
                        key={r.type}
                        type="button"
                        onClick={() => {
                          onReact(r.type)
                          setShowPicker(false)
                        }}
                        className={`w-9 h-9 flex items-center justify-center rounded-full text-[22px] transition-all duration-150 active:scale-90 ${
                          isSelected ? 'scale-125 bg-primary/10' : 'hover:scale-125'
                        }`}
                      >
                        {r.emoji}
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Heart button */}
            <button
              type="button"
              onClick={() => setShowPicker((v) => !v)}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-150 active:scale-90 ${
                member.myReaction
                  ? 'bg-red-500 text-white scale-110'
                  : 'bg-white/85 backdrop-blur-sm text-gray-500 hover:bg-white'
              }`}
            >
              {myReactionEmoji ? (
                <span className="text-[16px] leading-none">{myReactionEmoji}</span>
              ) : (
                <svg
                  width="15"
                  height="14"
                  viewBox="0 0 24 22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 3.61a5.5 5.5 0 0 0-7.78 0L12 4.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 20.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const CARD_CLASS = 'flex-1 flex flex-col overflow-hidden bg-white animate-fade-up'

function TodoDetailContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const teamId = Number(params.teamId)
  const todoId = Number(params.todoId)
  const { token, user } = useAuth()

  const [todo, setTodo] = useState<TodoDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const myStatusParam = searchParams.get('myStatus') as MyTodoStatus | null
  const [showToast, setShowToast] = useState(() => searchParams.get('certified') === '1')
  const [showBubble, setShowBubble] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowBubble(true), 650)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!showToast) return
    const t = setTimeout(() => setShowToast(false), 3000)
    return () => clearTimeout(t)
  }, [showToast])

  useEffect(() => {
    if (!token || !todoId) return
    getTodoDetail(todoId, token)
      .then((res) => setTodo(res))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : '투두를 불러오지 못했습니다.')
      })
      .finally(() => setIsLoading(false))
  }, [token, todoId])

  async function handleReact(participantId: number, type: ReactionType) {
    if (!token) return
    try {
      await postReaction(participantId, type, token)
      getTodoDetail(todoId, token)
        .then((res) => setTodo(res))
        .catch(() => null)
    } catch {
      // silently fail
    }
  }

  if (isLoading) {
    return (
      <div className={`${CARD_CLASS} items-center justify-center`}>
        <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !todo) {
    return (
      <div className={`${CARD_CLASS} px-6 py-10`}>
        <button
          onClick={() => router.back()}
          className="text-[13px] font-semibold text-muted mb-8 text-left hover:text-primary transition-colors"
        >
          ← 뒤로
        </button>
        <p className="text-[14px] text-muted text-center">{error || '투두를 찾을 수 없습니다.'}</p>
      </div>
    )
  }

  const { achieved, total } = parseAchievementCount(todo.achievementCount)
  const percentage = total > 0 ? Math.round((achieved / total) * 100) : 0
  const effectiveMyStatus: MyTodoStatus | null = todo.myStatus ?? myStatusParam
  const canCertify = effectiveMyStatus === '미완료'

  function navigateToCertify() {
    router.push(`/teams/${teamId}/todos/${todoId}/certify?title=${encodeURIComponent(todo!.title)}`)
  }

  return (
    <div className={CARD_CLASS}>
      {/* 헤더 (스크롤 고정) */}
      <div className="px-6 pt-8 pb-4">
        <button
          onClick={() => router.back()}
          className="text-[13px] font-semibold text-muted mb-6 flex items-center gap-1 hover:text-primary transition-colors"
        >
          ← 할 일 상세
        </button>

        <div className="flex items-start gap-2 mb-2">
          <h1 className="text-[20px] font-bold text-ink flex-1 leading-snug">{todo.title}</h1>
          <div className="mt-0.5">
            <TodoStatusBadge status={todo.status} />
          </div>
        </div>

        <p className="text-[13px] text-muted mb-5">
          {formatDeadline(todo.deadline)} 마감&nbsp;&nbsp;{todo.creatorNickname}
        </p>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[12px] font-semibold text-ink/60">달성 현황</span>
            <span className="text-[12px] text-primary font-semibold">
              {achieved}/{total}명 · {percentage}%
            </span>
          </div>
          <div className="relative pb-9">
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.75, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
            {showBubble && total > 0 && (
              <motion.div
                key={achieved}
                initial={{ opacity: 0, scale: 0.55, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 11, stiffness: 260 }}
                className="absolute top-3 pointer-events-none"
                style={{
                  left: `${Math.max(6, Math.min(achieved === 0 ? 0 : percentage, 84))}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="relative">
                  <div className="absolute -top-1.25 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-white border border-border/60" />
                  <div className="relative z-10 px-2.5 py-1.5 rounded-[10px] text-[11px] font-semibold whitespace-nowrap bg-white shadow-[0_2px_12px_rgba(0,0,0,0.10)] border border-border/60">
                    <span
                      className={
                        achieved === 0
                          ? 'text-slate-400'
                          : achieved === total
                            ? 'text-emerald-500'
                            : 'text-primary'
                      }
                    >
                      {getProgressMessage(achieved, total, todoId)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <p className="text-[13px] font-semibold text-ink/60 mb-3">인증 현황</p>
        <div className="flex flex-col gap-3">
          {todo.participants.map((member, idx) => {
            const byUserId = user?.userId ? member.userId === user.userId : false
            const byNickname =
              !byUserId && user?.nickname && user.nickname !== user.loginId
                ? member.nickname === user.nickname
                : false
            const isCurrentUser = byUserId || byNickname
            return (
              <MemberCertCard
                key={member.userId}
                member={member}
                index={idx}
                isCurrentUser={isCurrentUser}
                onCertify={navigateToCertify}
                onReact={(type) => handleReact(member.todoParticipantId, type)}
              />
            )
          })}
        </div>
      </div>

      {/* 바텀 버튼 (항상 고정) */}
      <div className="px-6 py-5 border-t border-border flex gap-3">
        <button
          onClick={() =>
            router.push(
              `/teams/${teamId}/todos/${todoId}/chat?title=${encodeURIComponent(todo.title)}`
            )
          }
          className="w-12 h-12 flex items-center justify-center rounded-[14px] bg-primary-light text-primary hover:bg-[#e0daf8] transition-all duration-200 shrink-0"
          aria-label="채팅"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M3 4a1 1 0 011-1h12a1 1 0 011 1v9a1 1 0 01-1 1H7l-4 3V4z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {canCertify ? (
          <button
            onClick={navigateToCertify}
            className="flex-1 py-3.75 bg-primary text-white text-[15px] font-semibold rounded-[14px] shadow-[0_4px_18px_rgba(91,79,207,0.22)] transition-all duration-200 hover:bg-primary-hover"
          >
            인증하기
          </button>
        ) : (
          <button
            onClick={() => router.back()}
            className="flex-1 py-3.75 bg-primary-light text-primary text-[15px] font-semibold rounded-[14px] transition-all duration-200 hover:bg-[#e0daf8]"
          >
            돌아가기
          </button>
        )}
      </div>

      {showToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-sm bg-primary-light text-ink text-[14px] font-semibold text-center py-4 rounded-[14px] shadow-[0_4px_24px_rgba(91,79,207,0.18)] animate-fade-up z-50">
          인증샷이 업로드되었습니다
        </div>
      )}
    </div>
  )
}

export default function TodoDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TodoDetailContent />
    </Suspense>
  )
}
