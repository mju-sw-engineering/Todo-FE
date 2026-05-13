'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ApiError } from '@/lib/apiClient'
import { getTeams } from '@/services/teamService'
import { useAuth } from '@/store/authStore'
import type { TeamListItem } from '@/types/team.types'

export default function TeamsPage() {
  const router = useRouter()
  const { token } = useAuth()

  const [teams, setTeams] = useState<TeamListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return

    getTeams(token)
      .then((res) => setTeams(res.teams))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : '팀 목록을 불러오지 못했습니다.')
      })
      .finally(() => setIsLoading(false))
  }, [token])

  return (
    <div className="min-h-screen bg-surface px-6 py-10">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[24px] font-bold text-ink tracking-tight">내 팀</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/teams/join')}
              className="px-4 py-2 rounded-[12px] border border-border text-[13px] font-semibold text-primary bg-white hover:bg-primary-light transition-colors duration-200"
            >
              팀 참여
            </button>
            <button
              onClick={() => router.push('/teams/new')}
              className="px-4 py-2 rounded-[12px] text-[13px] font-semibold text-white bg-primary hover:bg-primary-hover transition-colors duration-200"
            >
              팀 만들기
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-400 bg-red-50 rounded-xl px-4 py-3">{error}</p>
        ) : teams.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5M12 12a4 4 0 100-8 4 4 0 000 8z"
                />
              </svg>
            </div>
            <div>
              <p className="text-[16px] font-semibold text-ink">참여한 팀이 없습니다</p>
              <p className="mt-1 text-[13px] text-muted">팀을 만들거나 초대 코드로 참여해 보세요</p>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => router.push('/teams/join')}
                className="px-5 py-2.5 rounded-[12px] border border-border text-[13px] font-semibold text-primary bg-white hover:bg-primary-light transition-colors duration-200"
              >
                팀 참여하기
              </button>
              <button
                onClick={() => router.push('/teams/new')}
                className="px-5 py-2.5 rounded-[12px] text-[13px] font-semibold text-white bg-primary hover:bg-primary-hover transition-colors duration-200"
              >
                팀 만들기
              </button>
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {teams.map((team) => (
              <li key={team.teamId}>
                <button
                  onClick={() => router.push(`/teams/${team.teamId}`)}
                  className="w-full flex items-center gap-4 bg-white rounded-[18px] border border-border px-5 py-4 hover:border-primary hover:shadow-[0_4px_18px_rgba(91,79,207,0.10)] transition-all duration-200 text-left"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-primary-light flex-shrink-0">
                    {team.teamImageUrl ? (
                      <Image
                        src={team.teamImageUrl}
                        alt={team.teamName}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-primary"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5M12 12a4 4 0 100-8 4 4 0 000 8z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="text-[15px] font-semibold text-ink">{team.teamName}</span>
                  <svg
                    className="w-4 h-4 text-muted ml-auto flex-shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
