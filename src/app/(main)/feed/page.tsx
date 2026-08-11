'use client'

import { useEffect, useState } from 'react'
import { TeamRhythmCard } from './components/TeamRhythmCard'
import { MonthlyHiveCard } from './components/MonthlyHiveCard'
import { HiveShelfCard } from './components/HiveShelfCard'
import { BadgesCard } from './components/BadgesCard'
import { MOCK_BADGES } from './components/mockFeedData'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { getBadges, getHiveArchive, getMonthlyHive, getTeamRhythms } from '@/services/feedService'
import { useAuth } from '@/store/authStore'
import { PageLoader } from '@/components/ui/PageLoader'
import type { FeedBadge, HiveArchiveMonth, MonthlyHive, TeamRhythm } from '@/types/feed.types'

export default function FeedPage() {
  const { token } = useAuth()
  const { isLoading, error, run } = useAsyncTask(true)

  const [teamRhythms, setTeamRhythms] = useState<TeamRhythm[]>([])
  const [monthlyHive, setMonthlyHive] = useState<MonthlyHive | null>(null)
  const [hiveArchive, setHiveArchive] = useState<HiveArchiveMonth[]>([])
  const [badges, setBadges] = useState<FeedBadge[]>(MOCK_BADGES)

  useEffect(() => {
    if (!token) return
    run(
      async () => {
        const [rhythms, hive, archive, badgeList] = await Promise.all([
          getTeamRhythms(token),
          getMonthlyHive(token),
          getHiveArchive(token),
          // 배지 API가 아직 배포되지 않은 서버에서도 피드가 뜨도록 실패 시 목데이터를 유지한다
          getBadges(token).catch(() => MOCK_BADGES),
        ])
        setTeamRhythms(rhythms)
        setMonthlyHive(hive)
        setHiveArchive(archive)
        setBadges(badgeList)
      },
      { fallback: '피드를 불러오지 못했습니다.' }
    )
  }, [token, run])

  if (isLoading) return <PageLoader />

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-fade-up bg-[#faf4e4]">
      <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden pb-5">
        <div className="px-5 pt-7 pb-[18px]">
          <h1 className="text-[23px] font-black text-ink tracking-[-0.5px]">피드</h1>
        </div>

        {error && (
          <p className="mx-5 mb-4 text-sm text-status-red bg-status-red/10 rounded-[14px] px-4 py-3">
            {error}
          </p>
        )}

        <TeamRhythmCard teams={teamRhythms} />
        {monthlyHive && <MonthlyHiveCard hive={monthlyHive} />}
        {monthlyHive && <HiveShelfCard months={hiveArchive} current={monthlyHive} />}
        <BadgesCard badges={badges} />
      </div>
    </div>
  )
}
