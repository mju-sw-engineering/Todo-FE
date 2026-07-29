'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { parseAchievementCount, formatDeadline } from '@/lib/formatters'
import { useTodoDetail } from '@/hooks/useTodoDetail'
import { useAuth } from '@/store/authStore'
import { TodoStatusBadge } from '@/components/ui/TodoStatusBadge'
import { MemberCertCard } from './components/MemberCertCard'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/PageLoader'
import type { MyTodoStatus } from '@/types/todo.types'

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

const CARD_CLASS = 'flex-1 flex flex-col overflow-hidden bg-white animate-fade-up'

function TodoDetailContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const teamId = Number(params.teamId)
  const todoId = Number(params.todoId)
  const { user } = useAuth()
  const myStatusParam = searchParams.get('myStatus') as MyTodoStatus | null

  const { todo, isLoading, error, chatUnreadCount, effectiveMyStatus, handleReact } = useTodoDetail(
    todoId,
    useAuth().token,
    myStatusParam
  )

  const [showToast, setShowToast] = useState(() => searchParams.get('certified') === '1')
  const [showBubble, setShowBubble] = useState(false)
  const [now] = useState(() => Date.now())

  useEffect(() => {
    const t = setTimeout(() => setShowBubble(true), 650)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!showToast) return
    const t = setTimeout(() => setShowToast(false), 3000)
    return () => clearTimeout(t)
  }, [showToast])

  if (isLoading) return <PageLoader />

  if (error || !todo) {
    return (
      <div className={`${CARD_CLASS} px-6 py-10`}>
        <button
          onClick={() => router.back()}
          className="text-[13px] font-semibold text-muted mb-8 text-left hover:text-gray-700 transition-colors"
        >
          ← 뒤로
        </button>
        <p className="text-[14px] text-muted text-center">{error || '투두를 찾을 수 없습니다.'}</p>
      </div>
    )
  }

  const { achieved, total } = parseAchievementCount(todo.achievementCount)
  const percentage = total > 0 ? Math.round((achieved / total) * 100) : 0
  const isExpired = new Date(todo.deadline).getTime() < now
  const canCertify = effectiveMyStatus === '미완료' && !isExpired

  function navigateToCertify() {
    router.push(`/teams/${teamId}/todos/${todoId}/certify?title=${encodeURIComponent(todo!.title)}`)
  }

  return (
    <div className={CARD_CLASS}>
      <div className="px-6 pt-8 pb-4">
        <button
          onClick={() => router.back()}
          className="text-[13px] font-semibold text-muted mb-6 flex items-center gap-1 hover:text-gray-700 transition-colors"
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
            <span className="text-[12px] text-gray-700 font-semibold">
              {achieved}/{total}명 · {percentage}%
            </span>
          </div>
          <div className="relative pb-9">
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gray-900"
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
                            : 'text-gray-700'
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

      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <p className="text-[13px] font-semibold text-ink/60 mb-3">인증 현황</p>
        <div className="flex flex-col gap-3">
          {todo.participants.map((member) => {
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
                isCurrentUser={isCurrentUser}
                onCertify={navigateToCertify}
                onReact={(type) => handleReact(member.todoParticipantId, type)}
              />
            )
          })}
        </div>
      </div>

      <div className="px-6 py-5 border-t border-border flex gap-3">
        <button
          onClick={() =>
            router.push(
              `/teams/${teamId}/todos/${todoId}/chat?title=${encodeURIComponent(todo.title)}`
            )
          }
          className="relative w-14 h-12 flex flex-col items-center justify-center gap-0.5 rounded-[14px] bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 shrink-0"
          aria-label="팀원과 채팅"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path
              d="M3 4a1 1 0 011-1h12a1 1 0 011 1v9a1 1 0 01-1 1H7l-4 3V4z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[9px] font-semibold leading-none">채팅</span>
          {chatUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 flex items-center justify-center rounded-full bg-gray-900 text-white text-[10px] font-bold px-1 leading-none">
              {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
            </span>
          )}
        </button>
        {canCertify ? (
          <Button fullWidth={false} className="flex-1" onClick={navigateToCertify}>
            인증하기
          </Button>
        ) : (
          <Button
            variant="secondary"
            fullWidth={false}
            className="flex-1"
            onClick={() => router.back()}
          >
            돌아가기
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: 'rgba(17,17,17,0.68)' }}
            onClick={() => setShowToast(false)}
          >
            <motion.div
              initial={{ scale: 0.55, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 14, stiffness: 220 }}
              className="flex flex-col items-center gap-5"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', damping: 12, stiffness: 260 }}
                className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center"
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 12.5l5 5L20 6.5"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
              <div className="bg-white rounded-3xl px-8 py-5 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
                <p className="text-[22px] font-black text-gray-900">인증 완료!</p>
                <p className="text-[13px] text-gray-500 mt-1.5">인증샷이 업로드됐어요</p>
                <button
                  onClick={() => setShowToast(false)}
                  className="mt-4 w-full py-2.5 bg-gray-900 text-white text-[14px] font-bold rounded-2xl"
                >
                  확인
                </button>
              </div>
              <p className="text-white/50 text-[11px]">탭해서 닫기</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function TodoDetailPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <TodoDetailContent />
    </Suspense>
  )
}
