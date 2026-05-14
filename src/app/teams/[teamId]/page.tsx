'use client'

import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ApiError } from '@/lib/apiClient'
import { getTeamById } from '@/services/teamService'
import { useAuth } from '@/store/authStore'
import type { TeamDetailResponse, TeamMember } from '@/types/team.types'

function getInitials(nickname: string): string {
  const trimmed = nickname.trim()
  return trimmed.length <= 2 ? trimmed : trimmed.slice(0, 2)
}

function MemberAvatar({ member }: { member: TeamMember }) {
  if (member.profileImageUrl) {
    return (
      <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-border">
        <Image
          src={member.profileImageUrl}
          alt={member.nickname}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
    )
  }
  const isLeader = member.role === 'LEADER'
  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold ${
        isLeader ? 'bg-primary-light text-primary' : 'bg-[#eaf6ef] text-[#2d7a56]'
      }`}
    >
      {getInitials(member.nickname)}
    </div>
  )
}

function TeamAvatar({ imageUrl, name }: { imageUrl: string | null; name: string }) {
  return (
    <div className="relative w-14 h-14 shrink-0 rounded-full overflow-hidden border-2 border-primary/20 bg-primary-light">
      {imageUrl ? (
        <Image src={imageUrl} alt={name} fill className="object-cover" unoptimized />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-[22px] font-bold text-primary">{name.charAt(0)}</span>
        </div>
      )}
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
      <div className="flex-1 flex items-center justify-center bg-white md:rounded-[28px] md:border md:border-border md:shadow-[0_8px_40px_rgba(91,79,207,0.10)]">
        <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!team) return null

  return (
    <div className="flex-1 flex flex-col bg-white px-5 pt-8 pb-28 animate-fade-up md:flex-none md:rounded-[28px] md:border md:border-border md:shadow-[0_8px_40px_rgba(91,79,207,0.10)] md:px-9 md:py-11">
      <h1 className="text-[22px] font-bold text-ink text-center">TodoTeam</h1>
      <p className="text-[13px] text-muted text-center mt-1 mb-7">팀 상세 정보</p>

      {/* 팀 카드 */}
      <div className="bg-white rounded-[18px] border border-border mb-3 overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-4">
          <TeamAvatar imageUrl={team.teamImageUrl} name={team.teamName} />
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-ink truncate">{team.teamName}</p>
            <p className="text-[12px] text-muted mt-0.5">
              팀원 {team.memberCount}명 · 성공 {team.successCount}회
            </p>
          </div>
          <button
            onClick={() => setMembersOpen((prev) => !prev)}
            className="text-[13px] font-semibold text-primary shrink-0 px-3 py-1.5 rounded-lg bg-primary-light hover:bg-[#e0daf8] transition-colors duration-200"
          >
            {membersOpen ? '접기' : '펼치기'}
          </button>
        </div>

        {membersOpen && (
          <div className="border-t border-border px-4 py-4">
            <p className="text-[12px] font-semibold text-muted uppercase tracking-wider mb-3">
              팀원
            </p>
            {team.members.length === 0 ? (
              <p className="text-[13px] text-muted">아직 팀원이 없습니다</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {team.members.map((member) => (
                  <li key={member.userId} className="flex items-center gap-3">
                    <MemberAvatar member={member} />
                    <div className="flex-1 min-w-0">
                      <span className="text-[14px] font-medium text-ink">{member.nickname}</span>
                      {member.role === 'LEADER' && (
                        <span className="ml-2 text-[11px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full">
                          팀장
                        </span>
                      )}
                    </div>
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
          className="w-full flex items-center justify-between bg-white rounded-[18px] border border-border px-4 py-4 mb-3 transition-all duration-200 hover:border-primary/50 hover:shadow-[0_4px_18px_rgba(91,79,207,0.10)] active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center shrink-0">
              <svg
                className="w-4 h-4 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-[12px] text-muted">초대 코드</p>
              <p className="text-[14px] font-semibold text-ink">{team.inviteCode}</p>
            </div>
          </div>
          <span
            className={`text-[12px] font-semibold shrink-0 ml-2 px-3 py-1.5 rounded-lg transition-colors duration-200 ${copyDone ? 'text-[#2d7a56] bg-[#eaf6ef]' : 'text-primary bg-primary-light'}`}
          >
            {copyDone ? '복사됨 ✓' : '복사'}
          </span>
        </button>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border px-5 py-4">
        <button
          onClick={() => router.push('/teams')}
          className="w-full py-4 bg-primary-light text-primary text-[15px] font-semibold rounded-[14px] transition-all duration-200 hover:bg-[#e0daf8]"
        >
          목록으로
        </button>
      </div>
    </div>
  )
}
