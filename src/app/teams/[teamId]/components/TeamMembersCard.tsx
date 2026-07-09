'use client'

import { useState } from 'react'
import { MemberAvatar } from '@/components/ui/MemberAvatar'
import { TeamAvatar } from '@/components/ui/TeamAvatar'
import type { TeamDetailResponse, TeamMember } from '@/types/team.types'

interface TeamMembersCardProps {
  team: TeamDetailResponse
  currentUserId: number | undefined
  myRole: string | undefined
  isSubmitting: boolean
  onKick: (member: TeamMember) => void
}

export function TeamMembersCard({
  team,
  currentUserId,
  myRole,
  isSubmitting,
  onKick,
}: TeamMembersCardProps) {
  const [membersOpen, setMembersOpen] = useState(true)

  return (
    <div className="bg-white rounded-[18px] border border-border mb-3 overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-4">
        <TeamAvatar imageUrl={team.teamImageUrl} name={team.teamName} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-ink truncate">{team.teamName}</p>
          <p className="text-[12px] text-muted mt-0.5">
            팀원 {team.memberCount}명 · 성공 {team.successCount}회
          </p>
        </div>
        <button
          onClick={() => setMembersOpen((prev) => !prev)}
          className="text-[13px] font-semibold text-gray-700 shrink-0 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
        >
          {membersOpen ? '접기' : '펼치기'}
        </button>
      </div>

      {membersOpen && (
        <div className="border-t border-border px-4 py-4">
          <p className="text-[12px] font-semibold text-muted uppercase tracking-wider mb-3">팀원</p>
          {team.members.length === 0 ? (
            <p className="text-[13px] text-muted">아직 팀원이 없습니다</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {team.members.map((member) => {
                const isMe = member.userId === currentUserId
                const canKick = myRole === 'LEADER' && !isMe && member.role !== 'LEADER'
                return (
                  <li key={member.userId} className="flex items-center gap-3">
                    <MemberAvatar
                      profileImageUrl={member.profileImageUrl}
                      nickname={member.nickname}
                      size={40}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[14px] font-medium text-ink">
                        {member.nickname}
                        {isMe && <span className="ml-1.5 text-[11px] text-muted">(나)</span>}
                      </span>
                      {member.role === 'LEADER' && (
                        <span className="ml-2 text-[11px] font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full">
                          팀장
                        </span>
                      )}
                    </div>
                    {canKick && (
                      <button
                        onClick={() => onKick(member)}
                        disabled={isSubmitting}
                        className="shrink-0 text-[12px] font-semibold text-red-500 bg-red-50 px-2.5 py-1 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        탈퇴
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
