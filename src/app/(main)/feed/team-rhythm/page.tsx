'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BackButton } from '@/components/ui/BackButton'
import { PageLoader } from '@/components/ui/PageLoader'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { getTeamRhythms } from '@/services/feedService'
import { useAuth } from '@/store/authStore'
import type { TeamRhythm } from '@/types/feed.types'
import { TeamRhythmList } from '../components/TeamRhythmList'

export default function TeamRhythmDetailPage() {
  const router = useRouter()
  const { token } = useAuth()
  const { isLoading, run } = useAsyncTask(true)
  const [teams, setTeams] = useState<TeamRhythm[]>([])

  useEffect(() => {
    if (!token) return
    run(async () => setTeams(await getTeamRhythms(token)))
  }, [token, run])

  if (isLoading) return <PageLoader />

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-fade-up">
      <div className="flex-1 overflow-y-auto scrollbar-hidden pb-6">
        <div className="px-5 pt-6 pb-2 flex items-center gap-2">
          <BackButton onClick={() => router.push('/feed')} />
          <h1 className="text-[18px] font-black text-ink">팀 리듬</h1>
        </div>

        <TeamRhythmList teams={teams} />
      </div>
    </div>
  )
}
