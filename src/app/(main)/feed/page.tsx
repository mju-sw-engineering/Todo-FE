'use client'

import { TeamRhythmCard } from './components/TeamRhythmCard'
import { MonthlyHiveCard } from './components/MonthlyHiveCard'
import { HiveShelfCard } from './components/HiveShelfCard'
import { BadgesCard } from './components/BadgesCard'
import {
  buildMockMonthlyHive,
  MOCK_BADGES,
  MOCK_HIVE_ARCHIVE,
  MOCK_TEAM_RHYTHMS,
} from './components/mockFeedData'

export default function FeedPage() {
  const monthlyHive = buildMockMonthlyHive()

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-fade-up bg-[#faf4e4]">
      <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden pb-5">
        <div className="px-5 pt-7 pb-[18px]">
          <h1 className="text-[23px] font-black text-ink tracking-[-0.5px]">피드</h1>
        </div>

        <TeamRhythmCard teams={MOCK_TEAM_RHYTHMS} />
        <MonthlyHiveCard hive={monthlyHive} />
        <HiveShelfCard months={MOCK_HIVE_ARCHIVE} current={monthlyHive} />
        <BadgesCard badges={MOCK_BADGES} />
      </div>
    </div>
  )
}
