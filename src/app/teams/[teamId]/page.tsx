'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ApiError } from '@/lib/apiClient'
import { getTeamById } from '@/services/teamService'
import { useAuth } from '@/store/authStore'
import type { TeamDetailResponse, TeamMember } from '@/types/team.types'

function getInitials(nickname: string): string {
  const trimmed = nickname.trim()
  if (trimmed.length <= 2) return trimmed
  return trimmed.slice(0, 2)
}

function MemberAvatar({ member }: { member: TeamMember }) {
  const isLeader = member.role === 'LEADER'
  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold ${
        isLeader ? 'bg-primary-light text-primary' : 'bg-[#d4f0e4] text-[#2d7a56]'
      }`}
    >
      {getInitials(member.nickname)}
    </div>
  )
}

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

export default function TeamDetailPage() {
  const router = useRouter()
  const params = useParams()
  const teamId = Number(params.teamId)
  const { token } = useAuth()

  const [team, setTeam] = useState<TeamDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [membersOpen, setMembersOpen] = useState(true)
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
      <div className="flex-1 flex flex-col bg-white animate-fade-up md:flex-none md:rounded-[28px] md:border md:border-border md:shadow-[0_8px_40px_rgba(91,79,207,0.10)] items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!team) return null

  return (
    <div className="flex-1 flex flex-col bg-white px-6 py-10 animate-fade-up md:flex-none md:rounded-[28px] md:border md:border-border md:shadow-[0_8px_40px_rgba(91,79,207,0.10)] md:px-9 md:py-11">
      <h1 className="text-[22px] font-bold text-ink text-center mb-6">TodoTeam</h1>

      {/* 팀 카드 */}
      <div className="bg-white rounded-[18px] border border-border mb-3">
        <div className="flex items-center gap-4 px-5 py-4">
          <LevelBadge level={team.continuousTodoCount} />
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-ink truncate">{team.teamName}</p>
            <p className="text-[13px] text-muted mt-0.5">
              팀원 {team.memberCount}명 · 성공 {team.successCount} 회
            </p>
          </div>
          <button
            onClick={() => setMembersOpen((prev) => !prev)}
            className="text-[13px] font-semibold text-primary shrink-0"
          >
            {membersOpen ? '닫기' : '열기'}
          </button>
        </div>

        {membersOpen && (
          <div className="border-t border-border px-5 py-4">
            <p className="text-[13px] font-semibold text-ink mb-3">팀원</p>
            {team.members.length === 0 ? (
              <p className="text-[13px] text-muted">아직 팀원이 없습니다</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {team.members.map((member) => (
                  <li key={member.userId} className="flex items-center gap-3">
                    <MemberAvatar member={member} />
                    <span className="text-[14px] font-medium text-ink">
                      {member.nickname}
                      {member.role === 'LEADER' && (
                        <span className="ml-1 text-[13px] text-muted font-normal">(팀장)</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* 초대 코드 */}
      {team.inviteCode && (
        <button
          onClick={handleCopyInviteCode}
          className="w-full flex items-center justify-between bg-white rounded-[18px] border border-border px-5 py-4 mb-3 transition-colors duration-200 hover:bg-primary-light/40"
        >
          <span className="text-[14px] font-semibold text-ink">초대 코드: {team.inviteCode}</span>
          <span className="text-[12px] font-semibold text-primary shrink-0 ml-2">
            {copyDone ? '복사됨 ✓' : '복사'}
          </span>
        </button>
      )}

      <button
        onClick={() => router.push('/teams')}
        className="w-full text-center mt-4 text-[14px] font-medium text-muted hover:text-primary transition-colors duration-200"
      >
        목록으로
      </button>
    </div>
  )
}
