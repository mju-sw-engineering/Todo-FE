'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { parseAchievementCount, formatDeadline } from '@/lib/formatters'
import { useTodoDetail } from '@/hooks/useTodoDetail'
import { getTeamById } from '@/services/teamService'
import { getTodoWorkItemSubmission } from '@/services/todoService'
import { useAuth } from '@/store/authStore'
import { TodoStatusBadge } from '@/components/ui/TodoStatusBadge'
import { MemberCertCard } from './components/MemberCertCard'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/PageLoader'
import type { TeamMember } from '@/types/team.types'
import type { TodoWorkItem } from '@/types/todo.types'

const PROGRESS_MESSAGES = {
  none: ['아직 완료된 항목이 없어요', '첫 완료를 기다리고 있어요'],
  some: ['하나씩 완료하고 있어요 🔥', '좋은 흐름이에요 💪'],
  most: ['거의 다 왔어요! 🎯', '조금만 더! ⚡'],
  all: ['모두 완료! 🎊', '완벽하게 끝냈어요! ✨'],
}

function getProgressMessage(achieved: number, total: number, seed: number): string {
  const pick = (messages: string[]) => messages[seed % messages.length]
  if (total === 0) return ''
  if (achieved === 0) return pick(PROGRESS_MESSAGES.none)
  if (achieved === total) return pick(PROGRESS_MESSAGES.all)
  if (achieved / total >= 0.8) return pick(PROGRESS_MESSAGES.most)
  return pick(PROGRESS_MESSAGES.some)
}

function getWorkItemDeadline(workItem: TodoWorkItem, todoDeadline: string): string {
  return 'deadline' in workItem ? workItem.deadline : todoDeadline
}

const CARD_CLASS = 'flex-1 flex flex-col overflow-hidden bg-white animate-fade-up'

function TodoDetailContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const teamId = Number(params.teamId)
  const todoId = Number(params.todoId)
  const { token, user } = useAuth()
  const { todo, isLoading, error, handleReact, handleReassign } = useTodoDetail(todoId, token)

  const [members, setMembers] = useState<TeamMember[]>([])
  const [reassignTarget, setReassignTarget] = useState<TodoWorkItem | null>(null)
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<number | null>(null)
  const [isReassigning, setIsReassigning] = useState(false)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(() => searchParams.get('certified') === '1')
  const [showBubble, setShowBubble] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowBubble(true), 650)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!showToast) return
    const timer = setTimeout(() => setShowToast(false), 3000)
    return () => clearTimeout(timer)
  }, [showToast])

  useEffect(() => {
    if (!token || !teamId) return
    getTeamById(teamId, token)
      .then((team) => setMembers(team.members))
      .catch(() => setMembers([]))
  }, [teamId, token])

  if (isLoading) return <PageLoader />

  if (error || !todo) {
    return (
      <div className={`${CARD_CLASS} px-6 py-10`}>
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-8 text-left text-[13px] font-semibold text-muted"
        >
          ← 뒤로
        </button>
        <p className="text-center text-[14px] text-muted">{error || '투두를 찾을 수 없습니다.'}</p>
      </div>
    )
  }

  const { achieved, total } = parseAchievementCount(todo.achievementCount)
  const percentage = total > 0 ? Math.round((achieved / total) * 100) : 0
  const workItems: TodoWorkItem[] =
    todo.mode === 'TASK' ? (todo.tasks ?? []) : (todo.directAssignees ?? [])

  function navigateToCertify(workItem: TodoWorkItem) {
    const itemTitle = 'title' in workItem ? workItem.title : todo!.title
    const query = new URLSearchParams({
      title: itemTitle,
      mode: todo!.mode,
      workItemId: String(workItem.workItemId),
    })
    router.push(`/teams/${teamId}/todos/${todoId}/certify?${query}`)
  }

  async function openSubmission(workItemId: number) {
    if (!token) return
    setIsImageLoading(true)
    setActionError(null)
    try {
      const submission = await getTodoWorkItemSubmission(workItemId, token)
      setOriginalUrl(submission.originalUrl)
    } catch {
      setActionError('원본 이미지를 불러오지 못했습니다.')
    } finally {
      setIsImageLoading(false)
    }
  }

  async function confirmReassign() {
    if (!reassignTarget || !selectedAssigneeId) return
    setIsReassigning(true)
    setActionError(null)
    try {
      await handleReassign(reassignTarget.workItemId, selectedAssigneeId)
      setReassignTarget(null)
      setSelectedAssigneeId(null)
    } catch {
      setActionError('담당자를 재배정하지 못했습니다.')
    } finally {
      setIsReassigning(false)
    }
  }

  return (
    <div className={CARD_CLASS}>
      <div className="px-6 pt-8 pb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-1 text-[13px] font-semibold text-muted"
        >
          ← 할 일 상세
        </button>

        <div className="mb-2 flex items-start gap-2">
          <h1 className="flex-1 text-[20px] font-bold leading-snug text-ink">{todo.title}</h1>
          <TodoStatusBadge status={todo.status} />
        </div>
        <div className="mb-5 flex flex-wrap items-center gap-2 text-[13px] text-muted">
          <span>{formatDeadline(todo.deadline)} 최종 마감</span>
          <span>·</span>
          <span>{todo.creatorNickname}</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
            {todo.mode === 'TASK' ? 'TASK' : '같이 인증'}
          </span>
        </div>
        {todo.description && (
          <p className="mb-5 rounded-[12px] bg-gray-50 px-3.5 py-3 text-[13px] leading-relaxed text-gray-600">
            {todo.description}
          </p>
        )}

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-ink/60">달성 현황</span>
            <span className="text-[12px] font-semibold text-gray-700">
              {achieved}/{total}
              {todo.mode === 'TASK' ? '개' : '명'} · {percentage}%
            </span>
          </div>
          <div className="relative pb-9">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.75, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
            {showBubble && total > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.55, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="pointer-events-none absolute top-3"
                style={{
                  left: `${Math.max(6, Math.min(achieved === 0 ? 0 : percentage, 84))}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="whitespace-nowrap rounded-[10px] border border-border/60 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 shadow-sm">
                  {getProgressMessage(achieved, total, todoId)}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-ink/60">
            {todo.mode === 'TASK' ? 'Task 현황' : '인증 현황'}
          </p>
          {actionError && <span className="text-[11px] text-status-red">{actionError}</span>}
        </div>
        <div className="flex flex-col gap-3">
          {workItems.map((workItem) => (
            <MemberCertCard
              key={workItem.workItemId}
              workItem={workItem}
              mode={todo.mode}
              deadline={getWorkItemDeadline(workItem, todo.deadline)}
              isCurrentUser={workItem.assigneeId === user?.userId}
              onCertify={() => navigateToCertify(workItem)}
              onReact={(type) => handleReact(workItem.workItemId, type)}
              onViewSubmission={() => openSubmission(workItem.workItemId)}
              onReassign={() => {
                setReassignTarget(workItem)
                setSelectedAssigneeId(null)
              }}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-border px-6 py-5">
        <Button variant="secondary" onClick={() => router.back()}>
          돌아가기
        </Button>
      </div>

      <AnimatePresence>
        {reassignTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/35"
            onClick={() => setReassignTarget(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full max-w-97.5 rounded-t-3xl bg-white px-6 pt-6 pb-9"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 className="text-[17px] font-bold text-ink">담당자 재배정</h2>
              <p className="mt-1 text-[12px] text-muted">미배정 항목을 맡을 팀원을 선택해주세요.</p>
              <div className="my-5 max-h-60 space-y-2 overflow-y-auto">
                {members.map((member) => (
                  <button
                    key={member.userId}
                    type="button"
                    onClick={() => setSelectedAssigneeId(member.userId)}
                    className={`w-full rounded-[12px] border px-4 py-3 text-left text-[14px] font-semibold ${
                      selectedAssigneeId === member.userId
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-ink'
                    }`}
                  >
                    {member.nickname}
                  </button>
                ))}
              </div>
              <Button onClick={confirmReassign} disabled={!selectedAssigneeId || isReassigning}>
                {isReassigning ? '재배정 중...' : '재배정하기'}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(originalUrl || isImageLoading) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5"
            onClick={() => setOriginalUrl(null)}
          >
            {isImageLoading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={originalUrl!}
                alt="인증샷 원본"
                className="max-h-full max-w-full rounded-2xl object-contain"
                onClick={(event) => event.stopPropagation()}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65"
            onClick={() => setShowToast(false)}
          >
            <div className="rounded-3xl bg-white px-8 py-6 text-center shadow-xl">
              <p className="text-[22px] font-black text-gray-900">인증 완료!</p>
              <p className="mt-1.5 text-[13px] text-gray-500">인증샷이 업로드됐어요</p>
              <button
                type="button"
                onClick={() => setShowToast(false)}
                className="mt-4 w-full rounded-2xl bg-primary py-2.5 text-[14px] font-bold text-white"
              >
                확인
              </button>
            </div>
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
