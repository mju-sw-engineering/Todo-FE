'use client'

import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ApiError } from '@/lib/apiClient'
import { getTeamById } from '@/services/teamService'
import { useAuth } from '@/store/authStore'
import type { TeamDetailResponse } from '@/types/team.types'

export default function TeamDetailPage() {
  const router = useRouter()
  const params = useParams()
  const teamId = Number(params.teamId)
  const { token } = useAuth()

  const [team, setTeam] = useState<TeamDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copyDone, setCopyDone] = useState(false)

  useEffect(() => {
    if (!token || !teamId) return

    getTeamById(teamId, token)
      .then(setTeam)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 403) {
          router.replace('/teams')
        }
      })
      .finally(() => setIsLoading(false))
  }, [token, teamId, router])

  async function handleCopyInviteCode() {
    if (!team?.inviteCode) return
    await navigator.clipboard.writeText(team.inviteCode)
    setCopyDone(true)
    setTimeout(() => setCopyDone(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!team) return null

  const leader = team.members.find((m) => m.role === 'LEADER')

  return (
    <div className="min-h-screen bg-surface px-6 py-10">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push('/teams')}
          className="flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-primary transition-colors duration-200 mb-6"
        >
          <svg
            className="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          내 팀 목록
        </button>

        {/* 팀 헤더 */}
        <div className="bg-white rounded-[24px] border border-border shadow-[0_4px_24px_rgba(91,79,207,0.08)] px-6 py-7 mb-4">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary-light flex-shrink-0">
              {team.teamImageUrl ? (
                <Image
                  src={team.teamImageUrl}
                  alt={team.teamName}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
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
              )}
            </div>
            <div>
              <h1 className="text-[22px] font-bold text-ink leading-tight">{team.teamName}</h1>
              {leader && <p className="text-[13px] text-muted mt-0.5">팀장 · {leader.nickname}</p>}
            </div>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: '팀원', value: team.memberCount },
              { label: '성공 횟수', value: team.successCount },
              { label: '연속 달성', value: team.continuousTodoCount },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface rounded-[14px] px-3 py-3.5 text-center">
                <p className="text-[20px] font-bold text-primary">{value}</p>
                <p className="text-[11px] text-muted mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* 초대 코드 복사 */}
          {team.inviteCode && (
            <button
              onClick={handleCopyInviteCode}
              className="w-full flex items-center justify-between bg-primary-light rounded-[14px] px-4 py-3.5 hover:bg-[#e0daf8] transition-colors duration-200"
            >
              <div className="text-left">
                <p className="text-[11px] text-primary font-semibold tracking-wide uppercase">
                  초대 코드
                </p>
                <p className="text-[17px] font-bold text-ink tracking-[0.12em] mt-0.5">
                  {team.inviteCode}
                </p>
              </div>
              <span className="text-[12px] font-semibold text-primary">
                {copyDone ? '복사됨 ✓' : '복사'}
              </span>
            </button>
          )}
        </div>

        {/* 팀원 목록 */}
        <div className="bg-white rounded-[24px] border border-border shadow-[0_4px_24px_rgba(91,79,207,0.08)] px-6 py-6">
          <h2 className="text-[15px] font-bold text-ink mb-4">팀원 {team.memberCount}명</h2>
          <ul className="flex flex-col gap-3">
            {team.members.map((member) => (
              <li key={member.userId} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-light flex-shrink-0 relative">
                  {member.profileImageUrl ? (
                    <Image
                      src={member.profileImageUrl}
                      alt={member.nickname}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="text-[14px] font-semibold text-ink truncate">
                    {member.nickname}
                  </span>
                  {member.role === 'LEADER' && (
                    <span title="팀장">
                      <svg
                        className="w-4 h-4 text-yellow-400 flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M2.5 7.5L6 16h12l3.5-8.5-5 3-4.5-6-4.5 6-5-3z" />
                      </svg>
                    </span>
                  )}
                </div>
                {member.role === 'LEADER' && (
                  <span className="text-[11px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full flex-shrink-0">
                    팀장
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
