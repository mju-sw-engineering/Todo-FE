'use client'

import { motion } from 'framer-motion'
import { FaCrown } from 'react-icons/fa6'
import { TeamAvatar } from '@/components/ui/TeamAvatar'
import type { FeedTeamRanking } from '@/types/feed.types'

interface TeamRankingScrollProps {
  rankings: FeedTeamRanking[]
}

export function TeamRankingScroll({ rankings }: TeamRankingScrollProps) {
  return (
    <div className="scrollbar-hidden flex gap-2.5 overflow-x-auto overflow-y-hidden px-5 pb-1">
      {rankings.map((team, index) => {
        const isGold = team.rank === 1
        return (
          <motion.div
            key={team.teamId}
            initial={{ opacity: 0, y: 14, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.07, type: 'spring', stiffness: 320, damping: 24 }}
            whileTap={{ scale: 0.96 }}
            className={`shrink-0 w-28 rounded-2xl border px-3 py-2.5 ${
              isGold
                ? 'border-primary bg-primary/5 shadow-[0_6px_20px_rgba(102,154,255,0.22)]'
                : 'border-border bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black ${
                  isGold ? 'bg-primary text-white' : 'bg-neutral-30 text-muted'
                }`}
              >
                {team.rank}
              </span>
              {isGold && (
                <motion.span
                  animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 2.2 }}
                  className="text-primary"
                >
                  <FaCrown size={13} />
                </motion.span>
              )}
            </div>
            <TeamAvatar imageUrl={team.teamImageUrl} name={team.teamName} size="sm" />
            <p className="text-[12px] font-bold text-ink mt-1.5 truncate">{team.teamName}</p>
            <p className="text-[13px] font-black text-ink leading-none mt-0.5">
              {team.streakDays}
              <span className="text-[10px] font-semibold text-muted ml-0.5">일 연속</span>
            </p>
          </motion.div>
        )
      })}
    </div>
  )
}
