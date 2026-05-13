'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { ApiError } from '@/lib/apiClient'
import { getTeams } from '@/services/teamService'
import { useAuth } from '@/store/authStore'
import type { TeamListItem } from '@/types/team.types'

function LevelBadge({ level }: { level: number }) {
  return (
    <div className="relative w-14 h-14 shrink-0">
      <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
      <div className="absolute inset-1.25 rounded-full bg-primary-light flex flex-col items-center justify-center">
        <span className="text-[16px] font-bold text-primary leading-none">
          {String(level).padStart(2, '0')}
        </span>
        <span className="text-[9px] text-primary/70 leading-tight">Lv</span>
      </div>
    </div>
  )
}

function TeamsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token } = useAuth()

  const [teams, setTeams] = useState<TeamListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showToast, setShowToast] = useState(() => searchParams.get('created') === '1')

  useEffect(() => {
    if (!showToast) return
    const t = setTimeout(() => setShowToast(false), 3000)
    return () => clearTimeout(t)
  }, [showToast])

  useEffect(() => {
    if (!token) return
    getTeams(token)
      .then((res) => setTeams(res.teams))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : '팀 목록을 불러오지 못했습니다.')
      })
      .finally(() => setIsLoading(false))
  }, [token])

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col bg-white px-6 py-10 md:flex-none md:rounded-[28px] md:border md:border-border md:shadow-[0_8px_40px_rgba(91,79,207,0.10)] md:px-9 md:py-11 items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white px-6 py-10 animate-fade-up md:flex-none md:rounded-[28px] md:border md:border-border md:shadow-[0_8px_40px_rgba(91,79,207,0.10)] md:px-9 md:py-11">
      <h1 className="text-[22px] font-bold text-ink text-center mb-6">TodoTeam</h1>

      {error && <p className="text-sm text-red-400 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</p>}

      {teams.length === 0 ? (
        <div className="flex flex-col items-center gap-3 mt-20">
          <p className="text-[15px] text-ink mb-4">아직 생성된 팀이 없습니다!</p>
          <button
            onClick={() => router.push('/teams/new')}
            className="w-full py-3.75 bg-primary text-white text-[15px] font-semibold rounded-[14px] shadow-[0_4px_18px_rgba(91,79,207,0.22)] transition-all duration-200 hover:bg-primary-hover"
          >
            팀 생성하기
          </button>
          <button
            onClick={() => router.push('/teams/join')}
            className="w-full py-3.75 bg-primary-light text-primary text-[15px] font-semibold rounded-[14px] transition-all duration-200 hover:bg-[#e0daf8]"
          >
            팀 참여하기
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={() => router.push('/teams/new')}
            className="w-full py-3.75 bg-primary text-white text-[15px] font-semibold rounded-[14px] shadow-[0_4px_18px_rgba(91,79,207,0.22)] transition-all duration-200 hover:bg-primary-hover mb-4"
          >
            팀 생성하기
          </button>

          <ul className="flex flex-col gap-3">
            {teams.map((team) => (
              <li key={team.teamId}>
                <button
                  onClick={() => router.push(`/teams/${team.teamId}`)}
                  className="w-full flex items-center gap-4 bg-white rounded-[18px] border border-border px-5 py-4 text-left transition-all duration-200 hover:border-primary hover:shadow-[0_4px_18px_rgba(91,79,207,0.10)]"
                >
                  <LevelBadge level={team.continuousTodoCount ?? 0} />
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-ink truncate">{team.teamName}</p>
                    {(team.memberCount !== undefined || team.successCount !== undefined) && (
                      <p className="text-[13px] text-muted mt-0.5">
                        팀원 {team.memberCount ?? 0}명 · 성공 {team.successCount ?? 0} 회
                      </p>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-sm bg-primary-light text-ink text-[14px] font-semibold text-center py-4 rounded-[14px] shadow-[0_4px_24px_rgba(91,79,207,0.18)] animate-fade-up">
          팀 생성이 완료되었습니다
        </div>
      )}
    </div>
  )
}

export default function TeamsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TeamsContent />
    </Suspense>
  )
}
