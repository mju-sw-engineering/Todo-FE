'use client'

import { motion, useReducedMotion } from 'framer-motion'
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
  const reduceMotion = useReducedMotion()

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
    <div className="flex-1 flex flex-col overflow-hidden animate-fade-up bg-white">
      <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden pb-6 scrollbar-hidden">
        <div className="px-5 pt-7 pb-[18px]">
          <h1 className="text-[23px] font-black text-ink tracking-[-0.5px]">기록</h1>
          <p className="text-[12px] text-muted mt-0.5">팀과 함께 쌓아가는 꾸준함의 꿀</p>
        </div>

        <HeroCard />

        <div className="mx-5 mt-4 grid grid-cols-2 gap-1 rounded-full bg-neutral-30 p-1">
          {(
            [
              { key: 'personal', label: '개인' },
              { key: 'team', label: '팀' },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setScope(key)}
              className="relative py-2 text-[13px] font-bold transition-colors"
            >
              {scope === key && (
                <motion.span
                  layoutId="feed-scope-pill"
                  className="absolute inset-0 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
                  transition={
                    reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }
                  }
                />
              )}
              <span className={`relative ${scope === key ? 'text-ink' : 'text-muted'}`}>
                {label}
              </span>
            </button>
          ))}
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
