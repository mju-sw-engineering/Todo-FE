'use client'

import { useState } from 'react'

interface FeedVisibilityCardProps {
  isLeader: boolean
}

export function FeedVisibilityCard({ isLeader }: FeedVisibilityCardProps) {
  const [isPublic, setIsPublic] = useState(true)

  return (
    <div className="bg-white rounded-[18px] border border-border mb-3 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13.5px] font-bold text-ink">피드에 공개</p>
          <p className="text-[11.5px] text-muted leading-relaxed mt-1">
            {isLeader
              ? '켜면 다른 팀도 우리 팀의 연속 달성 랭킹과 인증 피드를 볼 수 있어요.'
              : isPublic
                ? '현재 다른 팀에게 우리 팀 랭킹과 인증 피드가 공개되어 있어요.'
                : '현재 우리 팀원들끼리만 서로의 인증을 볼 수 있어요.'}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          aria-label="피드에 공개"
          disabled={!isLeader}
          onClick={() => setIsPublic((p) => !p)}
          className={`shrink-0 w-10 h-6 rounded-full relative transition-colors duration-200 ${
            isPublic ? 'bg-gray-900' : 'bg-gray-200'
          } ${isLeader ? '' : 'opacity-60'}`}
        >
          <span
            className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              isPublic ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  )
}
