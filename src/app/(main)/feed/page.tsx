'use client'

import { TeamRankingPodium } from './components/TeamRankingPodium'
import { TeamRankingList } from './components/TeamRankingList'
import { MyHoneyRecordCalendar } from './components/MyHoneyRecordCalendar'
import { MOCK_RANKINGS } from './components/mockFeedData'

export default function FeedPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-fade-up bg-white">
      <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden pb-8">
        <div className="px-5 pt-6 pb-4">
          <h1 className="text-[20px] font-black text-ink leading-tight">팀 랭킹</h1>
          <p className="text-[12px] text-muted mt-0.5">우리 팀과 나의 기록을 확인해보세요</p>
        </div>

        <div
          className="mx-5 rounded-[18px] border border-border p-4"
          style={{
            background: 'linear-gradient(180deg, var(--color-primary-50) 0%, #ffffff 70%)',
          }}
        >
          <TeamRankingPodium rankings={MOCK_RANKINGS} />
          <div className="mt-4">
            <TeamRankingList rankings={MOCK_RANKINGS} />
          </div>
        </div>

        <div className="mx-5 mt-3 bg-white rounded-[18px] border border-border p-4">
          <p className="text-[14px] font-black text-ink mb-3">나의 꿀 기록</p>
          <MyHoneyRecordCalendar />
        </div>
      </div>
    </div>
  )
}
