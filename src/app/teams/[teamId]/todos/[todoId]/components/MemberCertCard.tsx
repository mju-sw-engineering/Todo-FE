'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiHeart } from 'react-icons/fi'
import { BlobAvatar } from '@/components/ui/BlobAvatar'
import { MemberAvatar } from '@/components/ui/MemberAvatar'
import { ReactionEmoji } from '@/components/ui/ReactionEmoji'
import type { MyTodoStatus, ReactionType, TodoParticipant } from '@/types/todo.types'

const CERT_BADGE_LABEL: Record<MyTodoStatus, string> = {
  완료: '완료',
  미완료: '미완료',
}

const CERT_BADGE_STYLE: Record<MyTodoStatus, string> = {
  완료: 'bg-gray-900 text-white',
  미완료: 'bg-gray-100 text-gray-400',
}

interface MemberCertCardProps {
  member: TodoParticipant
  isCurrentUser: boolean
  onCertify: () => void
  onReact: (type: ReactionType) => void
}

export function MemberCertCard({ member, isCurrentUser, onCertify, onReact }: MemberCertCardProps) {
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const status = member.status
  const isCompleted = status === '완료'
  const canCertify = isCurrentUser && status === '미완료'
  const canReact = !isCurrentUser && isCompleted
  const proofImageUrl = member.proofThumbnailUrl ?? member.proofImageUrl

  const activeReactions = (member.reactions ?? []).filter((r) => r.count > 0)
  const totalCount = activeReactions.reduce((s, r) => s + r.count, 0)

  return (
    <div
      className={`rounded-[18px] overflow-hidden border border-border ${canCertify ? 'cursor-pointer active:scale-[0.99] transition-transform' : ''}`}
      onClick={() => {
        if (canCertify) onCertify()
        if (showPicker) setShowPicker(false)
      }}
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-3 bg-white">
        <div className="flex items-center gap-2.5">
          <MemberAvatar
            profileImageUrl={member.profileImageUrl}
            nickname={member.nickname}
            size={32}
          />
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

      <div className="relative w-full h-44">
        {isCompleted && proofImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={proofImageUrl}
            alt="인증샷"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : isCompleted ? (
          <div className="absolute inset-0 bg-linear-to-br from-gray-100 to-gray-200" />
        ) : canCertify ? (
          <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center">
              <span className="text-[22px] font-light text-gray-400 leading-none">+</span>
            </div>
            <span className="text-[12px] text-gray-400">탭해서 인증하기</span>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center gap-2">
            <div className="animate-blob-float">
              <BlobAvatar seed={member.nickname} size={64} expressionOverride={3} />
            </div>
            <span className="text-[11px] font-semibold text-gray-400">아직 완료 전...</span>
          </div>
        )}

        {activeReactions.length > 0 && (
          <div className="absolute bottom-2.5 left-3 flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-2 py-0.5">
            <div className="flex -space-x-0.5">
              {activeReactions.slice(0, 3).map((r) => (
                <span key={r.type} className="leading-none drop-shadow-sm">
                  <ReactionEmoji type={r.type} size={16} />
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

        {canReact && (
          <div
            ref={pickerRef}
            className="absolute bottom-2.5 right-3 flex flex-col items-end gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
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
                        className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-150 active:scale-90 ${
                          isSelected
                            ? 'scale-125 bg-gray-100 shadow-inner'
                            : 'hover:scale-125 hover:bg-gray-50'
                        }`}
                      >
                        <ReactionEmoji type={r.type} size={28} />
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => setShowPicker((v) => !v)}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-150 active:scale-90 ${
                showPicker
                  ? 'bg-gray-900 text-white'
                  : 'bg-white/85 backdrop-blur-sm text-gray-500 hover:bg-white'
              }`}
            >
              <FiHeart size={15} strokeWidth={2.2} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
