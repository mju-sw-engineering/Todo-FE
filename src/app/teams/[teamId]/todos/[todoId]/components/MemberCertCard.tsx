'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BsFileEarmarkTextFill,
  BsFillFileEarmarkExcelFill,
  BsFillFileEarmarkFill,
  BsFillFileEarmarkPdfFill,
  BsFillFileEarmarkWordFill,
} from 'react-icons/bs'
import {
  FiCheck,
  FiClock,
  FiHeart,
  FiImage,
  FiFile as FiFileOutline,
  FiMaximize2,
  FiRefreshCw,
  FiUserPlus,
} from 'react-icons/fi'
import type { IconType } from 'react-icons'
import { MemberAvatar } from '@/components/ui/MemberAvatar'
import { ReactionEmoji } from '@/components/ui/ReactionEmoji'
import { formatDeadline } from '@/lib/formatters'
import { getTodoWorkItemSubmission } from '@/services/todoService'
import type { ReactionType, TodoMode, TodoWorkItem, WorkItemStatus } from '@/types/todo.types'

const REACTION_TYPES: ReactionType[] = ['LIKE', 'HEART', 'SURPRISED', 'DISLIKE', 'ANGRY']

const STATUS_LABEL: Record<WorkItemStatus, string> = {
  IN_PROGRESS: '진행 중',
  SUCCESS: '완료',
  FAIL: '실패',
}

const STATUS_STYLE: Record<WorkItemStatus, string> = {
  IN_PROGRESS: 'bg-neutral-30 text-muted',
  SUCCESS: 'bg-primary text-white',
  FAIL: 'bg-status-red/10 text-status-red',
}

/** 파일 확장자로 골라 보여줄 아이콘·톤. 실제 파일 종류가 눈에 보여야 "제출됐다"는 느낌이 난다 */
function fileTypeIcon(fileName: string): { Icon: IconType; toneClass: string } {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return { Icon: BsFillFileEarmarkPdfFill, toneClass: 'text-status-red' }
  if (ext === 'doc' || ext === 'docx')
    return { Icon: BsFillFileEarmarkWordFill, toneClass: 'text-primary' }
  if (ext === 'xls' || ext === 'xlsx' || ext === 'csv')
    return { Icon: BsFillFileEarmarkExcelFill, toneClass: 'text-meadow-dark' }
  if (ext === 'hwp' || ext === 'hwpx')
    return { Icon: BsFileEarmarkTextFill, toneClass: 'text-secondary-50' }
  return { Icon: BsFillFileEarmarkFill, toneClass: 'text-neutral-60' }
}

interface MemberCertCardProps {
  workItem: TodoWorkItem
  mode: TodoMode
  deadline: string
  isCurrentUser: boolean
  /** 이 카드가 지금 파일을 올리는 중인지 — 업로드 동안 자리를 지키며 스피너를 보여준다 */
  isCertifying?: boolean
  /** 업로드 진행률(0~100). null이면 업로드는 끝났고 제출 API 구간이라는 뜻 — 라벨이 갈린다 */
  certifyProgress?: number | null
  /** 이미지가 아닌 파일 제출일 때 실제 파일명·아이콘을 가져오는 데 필요 */
  token: string | null
  onCertify: () => void
  onReact: (type: ReactionType) => void
  onViewSubmission: () => void
  onReassign: () => void
}

export function MemberCertCard({
  workItem,
  mode,
  deadline,
  isCurrentUser,
  isCertifying = false,
  certifyProgress = null,
  token,
  onCertify,
  onReact,
  onViewSubmission,
  onReassign,
}: MemberCertCardProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [thumbnailFailed, setThumbnailFailed] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [now, setCurrentTime] = useState(() => Date.now())
  const pickerRef = useRef<HTMLDivElement>(null)
  const isExpired = new Date(deadline).getTime() <= now
  const isCompleted = workItem.status === 'SUCCESS'
  // 업로드(수 초) 동안은 진행률을, 업로드가 끝난 제출 API 구간(순간)은 고정 라벨을 보여준다.
  // 큰 파일에서 라벨이 몇 초씩 멈춰 있으면 실패한 것처럼 보이는 문제를 진행률이 해소한다.
  const certifyingLabel =
    certifyProgress !== null ? `올리는 중 · ${certifyProgress}%` : '제출 중...'
  const canCertify = isCurrentUser && workItem.status === 'IN_PROGRESS' && !isExpired
  // 마감 전이면 이미 완료된 항목도 같은 제출 API로 파일을 덮어쓸 수 있다 (재제출)
  const canResubmit = isCurrentUser && isCompleted && !isExpired
  const canReassign = workItem.unassigned && workItem.status === 'IN_PROGRESS' && !isExpired
  const canReact = !isCurrentUser && isCompleted
  const assigneeName = workItem.unassigned
    ? '미배정'
    : (workItem.assigneeNickname ?? '탈퇴한 사용자')
  const taskTitle = 'title' in workItem ? workItem.title : null
  const taskDescription = 'description' in workItem ? workItem.description : null
  const activeReactions = REACTION_TYPES.map((type) => ({
    type,
    count: workItem.reactions?.[type] ?? 0,
  })).filter((reaction) => reaction.count > 0)
  const totalCount = activeReactions.reduce((sum, reaction) => sum + reaction.count, 0)
  const analysis = workItem.aiAnalysis
  // FAILED는 아무것도 그리지 않는다. 판정이 못 붙었을 뿐 제출은 유효한데,
  // 실패를 표시하면 제출자가 자기 잘못으로 오해한다.
  const isAnalyzing = analysis?.status === 'PENDING'
  const isVerified = analysis?.status === 'DONE' && analysis.verdict === 'VERIFIED'
  const showAnalysis =
    isVerified || (analysis?.status === 'DONE' && (analysis.summary || analysis.mismatchReason))

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 30_000)
    return () => clearInterval(timer)
  }, [])

  // 이미지가 아닌 파일 제출이면 썸네일이 없어(또는 로드가 실패해) 어떤 파일인지 알아야
  // 종류에 맞는 아이콘·파일명을 보여줄 수 있다. 완료된 항목에서 한 번만 가져온다.
  const needsFileMeta = isCompleted && (!workItem.thumbnailUrl || thumbnailFailed)
  useEffect(() => {
    if (!needsFileMeta || !token || fileName) return
    let cancelled = false
    getTodoWorkItemSubmission(workItem.workItemId, token)
      .then((submission) => {
        if (!cancelled) setFileName(submission.fileName)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [needsFileMeta, token, fileName, workItem.workItemId])

  return (
    <article className="shrink-0 rounded-[18px] overflow-hidden border border-border bg-white">
      {mode === 'TASK' && (
        <div className="border-b border-border bg-surface px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-ink wrap-break-word">{taskTitle}</p>
              {taskDescription && (
                <p className="mt-1 text-[12px] leading-relaxed text-muted wrap-break-word">
                  {taskDescription}
                </p>
              )}
            </div>
            <span className="shrink-0 text-[10px] font-semibold text-muted">
              {formatDeadline(deadline)}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <MemberAvatar profileImageUrl={null} nickname={assigneeName} size={32} />
          <span
            className={`truncate text-[14px] font-semibold ${workItem.unassigned ? 'text-status-red' : 'text-ink'}`}
          >
            {assigneeName}
          </span>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLE[workItem.status]}`}
        >
          {workItem.unassigned ? '미배정' : STATUS_LABEL[workItem.status]}
        </span>
      </div>

      <div className="relative h-44 w-full">
        {isCompleted && workItem.thumbnailUrl && !thumbnailFailed ? (
          <div className="absolute inset-0 w-full">
            <button type="button" onClick={onViewSubmission} className="absolute inset-0 w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={workItem.thumbnailUrl}
                alt={`${assigneeName}님의 인증샷`}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                onError={() => setThumbnailFailed(true)}
              />
              <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                <FiMaximize2 size={10} />
                크게 보기
              </span>
            </button>
            {canResubmit && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onCertify()
                }}
                disabled={isCertifying}
                className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/60 disabled:opacity-50"
              >
                <FiRefreshCw size={11} />
                {isCertifying ? certifyingLabel : '재제출'}
              </button>
            )}
          </div>
        ) : isCompleted ? (
          (() => {
            const { Icon, toneClass } = fileTypeIcon(fileName ?? '')
            return (
              <div className="absolute inset-0 w-full">
                <button
                  type="button"
                  onClick={onViewSubmission}
                  className="absolute inset-0 flex w-full flex-col items-center justify-center gap-2 bg-white"
                >
                  <span
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-surface ${toneClass}`}
                  >
                    <Icon size={30} />
                  </span>
                  <span className="max-w-[85%] truncate text-[12px] font-semibold text-ink">
                    {fileName ?? '인증 파일'}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10.5px] font-semibold text-primary">
                    <FiMaximize2 size={10} />
                    파일 보기
                  </span>
                </button>
                {canResubmit && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onCertify()
                    }}
                    disabled={isCertifying}
                    className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-[10px] font-semibold text-muted transition-colors hover:bg-neutral-40 disabled:opacity-50"
                  >
                    <FiRefreshCw size={11} />
                    {isCertifying ? certifyingLabel : '재제출'}
                  </button>
                )}
              </div>
            )
          })()
        ) : canCertify ? (
          <button
            type="button"
            onClick={onCertify}
            disabled={isCertifying}
            className="absolute inset-0 flex w-full flex-col items-center justify-center gap-2 border-2 border-dashed border-neutral-40 bg-surface transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            {isCertifying ? (
              <>
                <span className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-[12px] font-semibold text-primary">{certifyingLabel}</span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1 text-neutral-60">
                  <FiImage size={20} />
                  <FiFileOutline size={20} />
                </span>
                <span className="text-[12px] font-semibold text-muted">
                  탭해서 사진이나 파일로 인증하기
                </span>
              </>
            )}
          </button>
        ) : canReassign ? (
          <button
            type="button"
            onClick={onReassign}
            className="absolute inset-0 flex w-full flex-col items-center justify-center gap-2 bg-status-red/10"
          >
            <FiUserPlus size={26} className="text-status-red" />
            <span className="text-[12px] font-semibold text-status-red">담당자 재배정</span>
          </button>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface">
            <FiClock size={28} className="text-neutral-50" />
            <span className="text-[11px] font-semibold text-muted">
              {workItem.status === 'FAIL'
                ? '마감되어 실패했어요'
                : isExpired
                  ? '마감되었어요'
                  : '아직 완료 전...'}
            </span>
          </div>
        )}

        {activeReactions.length > 0 && (
          <div className="absolute bottom-2.5 left-3 flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5 backdrop-blur-sm">
            <div className="flex -space-x-0.5">
              {activeReactions.slice(0, 3).map((reaction) => (
                <span key={reaction.type} className="leading-none drop-shadow-sm">
                  <ReactionEmoji type={reaction.type} size={16} />
                </span>
              ))}
            </div>
            <span className="text-[11px] font-semibold leading-none text-white">{totalCount}</span>
          </div>
        )}

        {canReact && (
          <div
            ref={pickerRef}
            className="absolute bottom-2.5 right-3 flex flex-col items-end gap-1.5"
            onClick={(event) => event.stopPropagation()}
          >
            <AnimatePresence>
              {showPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: 6 }}
                  className="flex items-center gap-0.5 rounded-full bg-white/95 px-2 py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.18)] backdrop-blur-md"
                >
                  {REACTION_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        onReact(type)
                        setShowPicker(false)
                      }}
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-90 ${
                        workItem.myReaction === type
                          ? 'scale-125 bg-neutral-30 shadow-inner'
                          : 'hover:scale-125 hover:bg-surface'
                      }`}
                    >
                      <ReactionEmoji type={type} size={28} />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={() => setShowPicker((visible) => !visible)}
              className={`flex h-8 w-8 items-center justify-center rounded-full shadow-md ${
                showPicker ? 'bg-primary text-white' : 'bg-white/85 text-muted backdrop-blur-sm'
              }`}
            >
              <FiHeart size={15} strokeWidth={2.2} />
            </button>
          </div>
        )}
      </div>

      {isAnalyzing && (
        <div className="px-4 py-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-[11px] font-semibold text-muted">
            <span className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-neutral-60 border-t-transparent" />
            내용 확인하는 중
          </span>
        </div>
      )}

      {analysis && showAnalysis && (
        <div className="px-4 py-3">
          {isVerified && (
            <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-meadow/35 px-2.5 py-1 text-[11px] font-semibold text-meadow-dark">
              <FiCheck size={12} strokeWidth={3} />
              인증 확인됨
            </span>
          )}
          {analysis.summary && (
            <p className="text-[12px] leading-relaxed text-muted wrap-break-word">
              {analysis.summary}
            </p>
          )}
          {analysis.mismatchReason && (
            <p className="mt-1 text-[12px] leading-relaxed text-status-red wrap-break-word">
              {analysis.mismatchReason}
            </p>
          )}
        </div>
      )}
    </article>
  )
}
