'use client'

import { useEffect, useState } from 'react'
import { TeamRhythmCard } from './components/TeamRhythmCard'
import { MyStreakGrid } from './components/MyStreakGrid'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { getMyStreak, getTeamRhythm } from '@/services/feedService'
import { useAuth } from '@/store/authStore'
import { PageLoader } from '@/components/ui/PageLoader'
import type { MyStreak, TeamRhythm } from '@/types/feed.types'

export default function FeedPage() {
  const { token } = useAuth()
  const [teams, setTeams] = useState<TeamRhythm[]>([])
  const [streak, setStreak] = useState<MyStreak | null>(null)
  const { isLoading, error, run } = useAsyncTask(true)

  useEffect(() => {
    if (!token) return
    run(
      async () => {
        const [rhythms, myStreak] = await Promise.all([getTeamRhythm(token), getMyStreak(token)])
        setTeams(rhythms)
        setStreak(myStreak)
      },
      { fallback: '피드를 불러오지 못했습니다.' }
    )
  }, [token, run])

  if (isLoading) return <PageLoader />

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-fade-up bg-[#f7f7f7]">
      <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden pb-5">
        <div className="px-5 pt-7 pb-[18px]">
          <h1 className="text-[23px] font-black text-ink tracking-[-0.5px]">피드</h1>
        </div>

        {error && (
          <p className="mx-5 mb-4 text-sm text-status-red bg-status-red/10 rounded-[14px] px-4 py-3">
            {error}
          </p>
        )}

        {teams.length > 0 && <TeamRhythmCard teams={teams} />}
        {streak && <MyStreakGrid streak={streak} />}
      </div>
    </div>
  )
}
