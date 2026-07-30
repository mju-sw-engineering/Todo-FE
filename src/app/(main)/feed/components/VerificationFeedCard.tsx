'use client'

import { motion } from 'framer-motion'
import { FiHeart } from 'react-icons/fi'
import { IoFlame } from 'react-icons/io5'
import { BlobAvatar } from '@/components/ui/BlobAvatar'
import type { FeedVerification } from '@/types/feed.types'

interface VerificationFeedCardProps {
  verification: FeedVerification
  index?: number
}

export function VerificationFeedCard({ verification, index = 0 }: VerificationFeedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: 'easeOut' }}
      className="bg-white rounded-[18px] border border-border overflow-hidden"
    >
      <div className="flex items-center gap-2.5 px-3.5 py-2.5">
        <BlobAvatar seed={verification.userNickname} size={32} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[13px] font-bold text-ink truncate min-w-0">
              {verification.userNickname}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 bg-primary/10 text-primary">
              {verification.teamName}
            </span>
          </div>
          <p className="text-[11px] text-muted mt-0.5">{verification.verifiedAt}</p>
        </div>
      </div>

      <div className="relative h-28 flex items-end p-3 border-t border-border bg-primary/5">
        <span className="bg-ink/70 backdrop-blur-sm text-white text-[12px] font-semibold px-2.5 py-1.5 rounded-full">
          {verification.todoTitle}
        </span>
      </div>

      <div className="flex items-center gap-3.5 px-3.5 py-2.5 text-[12px] font-semibold text-muted">
        <span className="flex items-center gap-1">
          <FiHeart className="text-status-red" size={13} />
          {verification.likeCount}
        </span>
        <span className="flex items-center gap-1">
          <IoFlame className="text-secondary-50" size={14} />
          {verification.streakDays}일째 연속 인증
        </span>
      </div>
    </motion.div>
  )
}
