'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiClock, FiHeart, FiImage, FiUserPlus } from 'react-icons/fi'
import { MemberAvatar } from '@/components/ui/MemberAvatar'
import { ReactionEmoji } from '@/components/ui/ReactionEmoji'
import { formatDeadline } from '@/lib/formatters'
import type { ReactionType, TodoMode, TodoWorkItem, WorkItemStatus } from '@/types/todo.types'

const REACTION_TYPES: ReactionType[] = ['LIKE', 'HEART', 'SURPRISED', 'DISLIKE', 'ANGRY']

const STATUS_LABEL: Record<WorkItemStatus, string> = {
  IN_PROGRESS: '진행 중',
  SUCCESS: '완료',
  FAIL: '실패',
}

const STATUS_STYLE: Record<WorkItemStatus, string> = {
  IN_PROGRESS: 'bg-gray-100 text-gray-500',
  SUCCESS: 'bg-primary text-white',
  FAIL: 'bg-status-red/10 text-status-red',
}

interface MemberCertCardProps {
  workItem: TodoWorkItem
  mode: TodoMode
  deadline: string
  isCurrentUser: boolean
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
  onCertify,
  onReact,
  onViewSubmission,
  onReassign,
}: MemberCertCardProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [now, setCurrentTime] = useState(() => Date.now())
  const pickerRef = useRef<HTMLDivElement>(null)
  const isExpired = new Date(deadline).getTime() <= now
  const isCompleted = workItem.status === 'SUCCESS'
  const canCertify = isCurrentUser && workItem.status === 'IN_PROGRESS' && !isExpired
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

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 30_000)
    return () => clearInterval(timer)
  }, [])

  return (
    <article className="rounded-[18px] overflow-hidden border border-border bg-white">
      {mode === 'TASK' && (
        <div className="border-b border-border bg-gray-50/70 px-4 py-3">
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
        {isCompleted && workItem.thumbnailUrl ? (
          <button type="button" onClick={onViewSubmission} className="absolute inset-0 w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={workItem.thumbnailUrl}
              alt={`${assigneeName}님의 인증샷`}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <span className="absolute bottom-3 right-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
              원본 보기
            </span>
          </button>
        ) : isCompleted ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-linear-to-br from-gray-100 to-gray-200">
            <FiImage size={28} className="text-gray-400" />
            <span className="text-[11px] font-semibold text-gray-500">
              보관된 인증 이미지가 없어요
            </span>
          </div>
        ) : canCertify ? (
          <button
            type="button"
            onClick={onCertify}
            className="absolute inset-0 flex w-full flex-col items-center justify-center gap-2 bg-gray-50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-[22px] font-light leading-none text-gray-400">
              +
            </span>
            <span className="text-[12px] text-gray-400">탭해서 인증하기</span>
          </button>
        ) : canReassign ? (
          <button
            type="button"
            onClick={onReassign}
            className="absolute inset-0 flex w-full flex-col items-center justify-center gap-2 bg-red-50/60"
          >
            <FiUserPlus size={26} className="text-status-red" />
            <span className="text-[12px] font-semibold text-status-red">담당자 재배정</span>
          </button>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-50">
            <FiClock size={28} className="text-gray-300" />
            <span className="text-[11px] font-semibold text-gray-400">
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
                          ? 'scale-125 bg-gray-100 shadow-inner'
                          : 'hover:scale-125 hover:bg-gray-50'
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
                showPicker ? 'bg-primary text-white' : 'bg-white/85 text-gray-500 backdrop-blur-sm'
              }`}
            >
              <FiHeart size={15} strokeWidth={2.2} />
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
