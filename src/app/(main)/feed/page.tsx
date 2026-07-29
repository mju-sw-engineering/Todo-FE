'use client'

import { TeamRankingScroll } from './components/TeamRankingScroll'
import { VerificationFeedCard } from './components/VerificationFeedCard'
import { MOCK_RANKINGS, MOCK_VERIFICATIONS } from './components/mockFeedData'

export default function FeedPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-fade-up bg-white">
      <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden pb-8">
        <div className="px-5 pt-6 pb-4">
          <h1 className="text-[20px] font-black text-ink leading-tight">피드</h1>
          <p className="text-[12px] text-muted mt-0.5">우리 팀과 다른 팀의 기록을 확인해보세요</p>
        </div>

        <p className="text-[11px] font-black text-muted tracking-wide uppercase px-5 mb-2.5">
          우리 팀 랭킹 · 연속 달성일
        </p>
        <TeamRankingScroll rankings={MOCK_RANKINGS} />

        <p className="text-[11px] font-black text-muted tracking-wide uppercase px-5 mt-6 mb-2.5">
          인증 피드
        </p>
        <div className="flex flex-col gap-3 px-5">
          {MOCK_VERIFICATIONS.map((verification, idx) => (
            <VerificationFeedCard
              key={verification.verificationId}
              verification={verification}
              index={idx}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
