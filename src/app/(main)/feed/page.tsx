'use client'

import { TeamRhythmCard } from './components/TeamRhythmCard'
import { MyStreakGrid } from './components/MyStreakGrid'
import { MOCK_TEAM_RHYTHMS, MOCK_MY_STREAK } from './components/mockFeedData'

export default function FeedPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-fade-up bg-[#f7f7f7]">
      <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden pb-5">
        <div className="px-5 pt-7 pb-[18px]">
          <h1 className="text-[23px] font-black text-ink tracking-[-0.5px]">피드</h1>
        </div>

        <TeamRhythmCard teams={MOCK_TEAM_RHYTHMS} />
        <MyStreakGrid streak={MOCK_MY_STREAK} />
      </div>
    </div>
  )
}
