'use client'

import { useEffect, useState } from 'react'
import { HeroCard } from './components/HeroCard'
import { TeamRhythmList } from './components/TeamRhythmList'
import { HivePreviewCard } from './components/HivePreviewCard'
import { HiveShelfCard } from './components/HiveShelfCard'
import { BadgesCard } from './components/BadgesCard'
import { MOCK_BADGES } from './components/mockFeedData'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { getBadges, getHiveArchive, getMonthlyHive, getTeamRhythms } from '@/services/feedService'
import { useAuth } from '@/store/authStore'
import { PageLoader } from '@/components/ui/PageLoader'
import type { FeedBadge, HiveArchiveMonth, MonthlyHive, TeamRhythm } from '@/types/feed.types'

type FeedScope = 'personal' | 'team'

export default function FeedPage() {
  const { token } = useAuth()
  const { isLoading, run } = useAsyncTask(true)
  const [scope, setScope] = useState<FeedScope>('personal')

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
    <div className="flex-1 flex flex-col overflow-hidden animate-fade-up bg-[linear-gradient(180deg,#8fb4ff_0%,#b3ccff_45%,#f5f8ff_100%)]">
      <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden pb-6 scrollbar-hidden">
        <div className="px-5 pt-7 pb-[18px]">
          <h1 className="text-[23px] font-black text-white tracking-[-0.5px]">기록</h1>
          <p className="text-[12px] text-white/85 mt-0.5">팀과 함께 쌓아가는 꾸준함의 꿀</p>
        </div>

        <HeroCard />

        <div className="mx-5 mt-4 grid grid-cols-2 gap-1 rounded-full bg-white/70 p-1 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setScope('personal')}
            className={`rounded-full py-2 text-[13px] font-bold transition-all duration-150 ${
              scope === 'personal' ? 'bg-primary text-white' : 'text-ink/70 hover:text-ink'
            }`}
          >
            개인
          </button>
          <button
            type="button"
            onClick={() => setScope('team')}
            className={`rounded-full py-2 text-[13px] font-bold transition-all duration-150 ${
              scope === 'team' ? 'bg-primary text-white' : 'text-ink/70 hover:text-ink'
            }`}
          >
            팀
          </button>
        </div>

        {scope === 'personal' ? (
          <>
            {monthlyHive && <HivePreviewCard hive={monthlyHive} />}
            <BadgesCard badges={badges} />
            {monthlyHive && <HiveShelfCard months={hiveArchive} current={monthlyHive} />}
          </>
        ) : (
          <TeamRhythmList teams={teamRhythms} />
        )}
      </div>
    </div>
  )
}
