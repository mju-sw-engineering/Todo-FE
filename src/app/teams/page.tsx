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
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)

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
        <div className="flex flex-col items-center mt-16 flex-1">
          <div className="flex flex-col items-center gap-3 flex-1 justify-center">
            <svg
              className="w-14 h-14 text-muted/60"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p className="text-[17px] font-bold text-ink">소속된 팀이 없습니다</p>
            <p className="text-[14px] text-muted text-center leading-relaxed">
              팀에 참여하거나 새 팀을 만들면
              <br />
              함께 할 일을 관리할 수 있어요
            </p>
          </div>
          <div className="w-full flex flex-col gap-3 pb-2">
            <button
              onClick={() => router.push('/teams/new')}
              className="w-full py-3.75 bg-primary text-white text-[15px] font-semibold rounded-[14px] shadow-[0_4px_18px_rgba(91,79,207,0.22)] transition-all duration-200 hover:bg-primary-hover"
            >
              + 팀 만들기
            </button>
            <button
              onClick={() => router.push('/teams/join')}
              className="w-full py-3.75 bg-primary-light text-primary text-[15px] font-semibold rounded-[14px] transition-all duration-200 hover:bg-[#e0daf8]"
            >
              팀 참여하기
            </button>
          </div>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-3 flex-1">
            {teams.map((team) => {
              const isSelected = selectedTeamId === team.teamId
              return (
                <li key={team.teamId}>
                  <div
                    className={`w-full flex items-center gap-4 bg-white rounded-[18px] border px-5 py-4 transition-all duration-200 ${
                      isSelected
                        ? 'border-primary shadow-[0_4px_18px_rgba(91,79,207,0.15)]'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <button
                      onClick={() => router.push(`/teams/${team.teamId}`)}
                      className="flex items-center gap-4 flex-1 min-w-0 text-left"
                    >
                      <LevelBadge level={team.continuousTodoCount ?? 0} />
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold text-ink truncate">
                          {team.teamName}
                        </p>
                        {(team.memberCount !== undefined || team.successCount !== undefined) && (
                          <p className="text-[13px] text-muted mt-0.5">
                            팀원 {team.memberCount ?? 0}명 · 성공 {team.successCount ?? 0} 회
                          </p>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        setSelectedTeamId((prev) => (prev === team.teamId ? null : team.teamId))
                      }
                      className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-border bg-white hover:border-primary/60'
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-3.5 h-3.5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="flex flex-col gap-3 mt-4">
            {selectedTeamId !== null ? (
              <button
                onClick={() => router.push(`/teams/${selectedTeamId}/todos`)}
                className="w-full py-3.75 bg-primary text-white text-[15px] font-semibold rounded-[14px] shadow-[0_4px_18px_rgba(91,79,207,0.22)] transition-all duration-200 hover:bg-primary-hover"
              >
                다음
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push('/teams/new')}
                  className="w-full py-3.75 bg-primary text-white text-[15px] font-semibold rounded-[14px] shadow-[0_4px_18px_rgba(91,79,207,0.22)] transition-all duration-200 hover:bg-primary-hover"
                >
                  + 팀 만들기
                </button>
                <button
                  onClick={() => router.push('/teams/join')}
                  className="w-full py-3.75 bg-primary-light text-primary text-[15px] font-semibold rounded-[14px] transition-all duration-200 hover:bg-[#e0daf8]"
                >
                  팀 참여하기
                </button>
              </>
            )}
          </div>
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
