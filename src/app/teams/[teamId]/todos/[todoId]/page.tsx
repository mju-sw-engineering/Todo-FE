'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import { FiFile } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { parseAchievementCount, formatDeadline } from '@/lib/formatters'
import { getErrorMessage } from '@/lib/apiError'
import { compressImageFile } from '@/lib/imageCompression'
import {
  PROOF_FILE_ACCEPT,
  getProofUploadContentType,
  isProofImageFile,
  validateProofFile,
} from '@/lib/proofFile'
import { useTodoDetail } from '@/hooks/useTodoDetail'
import { getTeamById } from '@/services/teamService'
import { putFileWithProgress } from '@/lib/apiClient'
import { getPresignedUploadUrl } from '@/services/fileService'
import { getTodoWorkItemSubmission, submitTodo, submitTodoWorkItem } from '@/services/todoService'
import { useAuth } from '@/store/authStore'
import { TodoStatusBadge } from '@/components/ui/TodoStatusBadge'
import { BeePose } from '@/components/bee/BeePose'
import { MemberCertCard } from './components/MemberCertCard'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/PageLoader'
import type { TeamMember } from '@/types/team.types'
import type { TodoWorkItem, TodoWorkItemSubmission } from '@/types/todo.types'

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
  const { todo, isLoading, error, refreshTodo, handleReact, handleReassign } = useTodoDetail(
    todoId,
    teamId,
    token
  )

  const [members, setMembers] = useState<TeamMember[]>([])
  const [reassignTarget, setReassignTarget] = useState<TodoWorkItem | null>(null)
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<number | null>(null)
  const [isReassigning, setIsReassigning] = useState(false)
  const [submission, setSubmission] = useState<TodoWorkItemSubmission | null>(null)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [showToast, setShowToast] = useState(() => searchParams.get('certified') === '1')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [certifyTarget, setCertifyTarget] = useState<TodoWorkItem | null>(null)
  const [certifyingId, setCertifyingId] = useState<number | null>(null)
  /** 업로드 진행률(0~100). 업로드가 끝나 제출 API 구간이면 null — 카드 라벨이 이걸로 갈린다. */
  const [certifyProgress, setCertifyProgress] = useState<number | null>(null)

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
        <p className="text-center text-[14px] text-muted">{error || '할 일을 찾을 수 없습니다.'}</p>
      </div>
    )
  }

  const { achieved, total } = parseAchievementCount(todo.achievementCount)
  const percentage = total > 0 ? Math.round((achieved / total) * 100) : 0
  const workItems: TodoWorkItem[] =
    todo.mode === 'TASK' ? (todo.tasks ?? []) : (todo.directAssignees ?? [])

  function triggerCertify(workItem: TodoWorkItem) {
    setCertifyTarget(workItem)
    fileInputRef.current?.click()
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    const target = certifyTarget
    if (!file || !target || !token) return

    const validationError = validateProofFile(file)
    if (validationError) {
      toast.error(validationError)
      return
    }

    setCertifyingId(target.workItemId)
    setCertifyProgress(0)
    try {
      const originalFileName = file.name
      const uploadFile = isProofImageFile(file) ? await compressImageFile(file) : file
      const { uploadUrl, objectKey } = await getPresignedUploadUrl(
        {
          type: 'PROOF',
          fileName: uploadFile.name,
          contentType: getProofUploadContentType(uploadFile),
          fileSize: uploadFile.size,
          todoId,
        },
        token
      )
      await putFileWithProgress(uploadUrl, uploadFile, { onProgress: setCertifyProgress })
      // 업로드가 끝나고 제출 API 구간으로 넘어간다. 카드 라벨이 "제출 중..."으로 바뀐다.
      setCertifyProgress(null)
      const request = { proofImageKey: objectKey, proofFileName: originalFileName }
      if (todo!.mode === 'TASK') {
        await submitTodoWorkItem(target.workItemId, request, token)
      } else {
        await submitTodo(todoId, request, token)
      }
      await refreshTodo({ force: true })
      setShowToast(true)
    } catch (err) {
      toast.error(getErrorMessage(err, '인증샷 업로드에 실패했습니다. 다시 시도해주세요.'))
    } finally {
      setCertifyingId(null)
      setCertifyTarget(null)
      setCertifyProgress(null)
    }
  }

  async function openSubmission(workItemId: number) {
    if (!token) return
    setIsImageLoading(true)
    try {
      const result = await getTodoWorkItemSubmission(workItemId, token)
      setSubmission(result)
    } catch {
      toast.error('인증 파일을 불러오지 못했습니다.')
    } finally {
      setIsImageLoading(false)
    }
  }

  async function confirmReassign() {
    if (!reassignTarget || !selectedAssigneeId) return
    setIsReassigning(true)
    try {
      await handleReassign(reassignTarget.workItemId, selectedAssigneeId)
      setReassignTarget(null)
      setSelectedAssigneeId(null)
    } catch {
      toast.error('담당자를 재배정하지 못했습니다.')
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
        <div className="mb-5 flex flex-wrap items-center gap-2 text-[13px]">
          <span className="font-bold text-ink">{formatDeadline(todo.deadline)} 최종 마감</span>
          <span className="rounded-full bg-neutral-30 px-2 py-0.5 text-[10px] font-bold text-muted">
            {todo.mode === 'TASK' ? 'TASK' : '그룹 인증'}
          </span>
        </div>
        {todo.description && (
          <p className="mb-5 rounded-[12px] bg-surface px-3.5 py-3 text-[13px] leading-relaxed text-ink/70">
            {todo.description}
          </p>
        )}

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-ink/60">달성 현황</span>
            <span className="text-[12px] font-semibold text-ink">
              {achieved}/{total}
              {todo.mode === 'TASK' ? '개' : '명'}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-30">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.75, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-ink/60">
            {todo.mode === 'TASK' ? 'Task 현황' : '인증 현황'}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {workItems.map((workItem) => (
            <MemberCertCard
              key={workItem.workItemId}
              workItem={workItem}
              mode={todo.mode}
              deadline={getWorkItemDeadline(workItem, todo.deadline)}
              isCurrentUser={workItem.assigneeId === user?.userId}
              isCertifying={certifyingId === workItem.workItemId}
              certifyProgress={certifyingId === workItem.workItemId ? certifyProgress : null}
              token={token}
              onCertify={() => triggerCertify(workItem)}
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

      <input
        ref={fileInputRef}
        type="file"
        accept={PROOF_FILE_ACCEPT}
        className="sr-only"
        onChange={handleFileSelected}
      />

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
        {(submission || isImageLoading) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5"
            onClick={() => setSubmission(null)}
          >
            {isImageLoading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : submission &&
              (submission.kind === 'IMAGE' ||
                (submission.kind === null && submission.contentType?.startsWith('image/'))) ? (
              <div
                className="relative max-h-full max-w-full"
                onClick={(event) => event.stopPropagation()}
              >
                {submission.resubmitted && (
                  <span className="absolute top-3 left-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                    재제출됨
                  </span>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={submission.originalUrl}
                  alt="인증샷 원본"
                  className="max-h-full max-w-full rounded-2xl object-contain"
                />
              </div>
            ) : submission ? (
              <div
                className="relative flex w-full max-w-80 flex-col items-center gap-4 rounded-2xl bg-white px-6 py-8"
                onClick={(event) => event.stopPropagation()}
              >
                {submission.resubmitted && (
                  <span className="absolute top-3 left-3 rounded-full bg-surface px-2.5 py-1 text-[10px] font-semibold text-muted">
                    재제출됨
                  </span>
                )}
                <FiFile size={32} className="text-muted" />
                <p className="wrap-break-word text-center text-[14px] font-semibold text-ink">
                  {submission.fileName}
                </p>
                <a
                  href={submission.originalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full rounded-[14px] bg-primary py-3 text-center text-[14px] font-semibold text-white transition-colors hover:bg-primary-hover"
                >
                  다운로드
                </a>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/65 px-6 py-10"
            onClick={() => setShowToast(false)}
          >
            <div className="relative my-auto w-full max-w-sm shrink-0 rounded-[32px] bg-white px-10 py-10 text-center shadow-xl">
              <div className="relative mx-auto mb-2 w-fit">
                <BeePose pose="thumbsUp" size={144} />
                <span className="absolute -right-1 -bottom-1 block h-13 w-13 overflow-hidden rounded-full shadow-md ring-4 ring-white">
                  <Image
                    src="/images/decor/check-burst.svg"
                    alt=""
                    fill
                    unoptimized
                    className="pointer-events-none object-cover"
                  />
                </span>
              </div>
              <p className="text-[28px] font-black text-ink">인증 완료!</p>
              <p className="mt-2 text-[15px] text-muted">인증샷이 업로드됐어요</p>
              <button
                type="button"
                onClick={() => setShowToast(false)}
                className="mt-6 w-full rounded-2xl bg-primary py-3.5 text-[16px] font-bold text-white"
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
