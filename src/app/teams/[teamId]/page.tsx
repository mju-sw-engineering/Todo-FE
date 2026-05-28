'use client'

import { useParams, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { TeamAvatar } from '@/components/ui/TeamAvatar'
import { PlantIcon, getPlantStageLabel } from '@/components/ui/PlantIcon'
import { StreakCelebration, isStreakSkippedToday } from '@/components/ui/StreakCelebration'
import { ApiError } from '@/lib/apiClient'
import { getTeamById } from '@/services/teamService'
import { useAuth } from '@/store/authStore'
import type { TeamDetailResponse, TeamMember } from '@/types/team.types'

const PLANT_STAGES = [
  { count: 0, label: '씨앗', range: '0일', desc: '아직 시작 전이에요' },
  { count: 1, label: '새싹', range: '1~3일', desc: '이제 막 시작했어요' },
  { count: 4, label: '식물', range: '4~10일', desc: '잘 자라고 있어요' },
  { count: 11, label: '나무', range: '11~20일', desc: '많이 성장했어요' },
  { count: 21, label: '꽃', range: '21일 이상', desc: '최고 단계예요!' },
]

function getStageIndex(count: number): number {
  if (count >= 21) return 4
  if (count >= 11) return 3
  if (count >= 4) return 2
  if (count >= 1) return 1
  return 0
}

function getInitials(nickname: string): string {
  const trimmed = nickname.trim()
  return trimmed.length <= 2 ? trimmed : trimmed.slice(0, 2)
}

function MemberAvatar({ member }: { member: TeamMember }) {
  const isLeader = member.role === 'LEADER'
  if (member.profileImageUrl) {
    return (
      <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={member.profileImageUrl}
          alt={member.nickname}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }
  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold ${
        isLeader ? 'bg-gray-100 text-gray-700' : 'bg-[#eaf6ef] text-[#2d7a56]'
      }`}
    >
      {getInitials(member.nickname)}
    </div>
  )
}

const POPOVER_WIDTH = 252

function PlantInfoPopover({
  count,
  anchor,
  onClose,
}: {
  count: number
  anchor: DOMRect
  onClose: () => void
}) {
  const gap = 10
  const arrowSize = 6

  let left = anchor.left + anchor.width / 2 - POPOVER_WIDTH / 2
  left = Math.max(12, Math.min(left, window.innerWidth - POPOVER_WIDTH - 12))
  const arrowLeft = anchor.left + anchor.width / 2 - left - arrowSize

  const spaceBelow = window.innerHeight - anchor.bottom
  const opensDown = spaceBelow > 280
  const top = opensDown ? anchor.bottom + gap : undefined
  const bottom = opensDown ? undefined : window.innerHeight - anchor.top + gap

  return createPortal(
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: opensDown ? -6 : 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: opensDown ? -6 : 6 }}
        transition={{ type: 'spring', damping: 22, stiffness: 420, mass: 0.5 }}
        style={{ top, bottom, left, width: POPOVER_WIDTH }}
        className="fixed z-50 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.13)] border border-border p-3.5"
      >
        {opensDown && (
          <div
            className="absolute -top-1.5 w-3 h-3 bg-white border-l border-t border-border rotate-45 rounded-tl-sm"
            style={{ left: arrowLeft }}
          />
        )}

        <p className="text-[12px] font-bold text-ink mb-2.5 px-0.5">성장 단계</p>
        <div className="flex flex-col gap-1">
          {PLANT_STAGES.map((stage, i) => {
            const isCurrent = getStageIndex(count) === i
            return (
              <div
                key={stage.label}
                className={`flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 ${
                  isCurrent ? 'bg-gray-100' : ''
                }`}
              >
                <div className="w-6 h-8 shrink-0">
                  <PlantIcon count={stage.count} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[12px] font-semibold leading-tight ${isCurrent ? 'text-gray-900' : 'text-ink'}`}
                  >
                    {stage.label}
                  </p>
                  <p className="text-[10px] text-muted mt-0.5">{stage.range}</p>
                </div>
                {isCurrent ? (
                  <span className="text-[10px] font-semibold text-gray-900 bg-white px-2 py-0.5 rounded-full border border-gray-200 shrink-0">
                    현재
                  </span>
                ) : (
                  <p className="text-[10px] text-muted shrink-0">{stage.desc}</p>
                )}
              </div>
            )
          })}
        </div>

        {!opensDown && (
          <div
            className="absolute -bottom-1.5 w-3 h-3 bg-white border-r border-b border-border rotate-45 rounded-br-sm"
            style={{ left: arrowLeft }}
          />
        )}
      </motion.div>
    </>,
    document.body
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
  const [plantInfoAnchor, setPlantInfoAnchor] = useState<DOMRect | null>(null)
  const [showStreak, setShowStreak] = useState(false)
  const infoButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!token || !teamId) return
    getTeamById(teamId, token)
      .then((data) => {
        setTeam(data)
        if (data.continuousTodoCount > 0 && !isStreakSkippedToday(teamId)) setShowStreak(true)
      })
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
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-[3px] border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!team) return null

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-fade-up">
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors shrink-0"
            aria-label="뒤로가기"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="text-[20px] font-black text-ink leading-tight truncate">
              {team.teamName}
            </h1>
            <p className="text-[12px] text-muted mt-0.5">팀 정보</p>
          </div>
        </div>

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
                          <span className="ml-2 text-[11px] font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full">
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

        {/* 연속 성공 스트릭 카드 */}
        <div className="bg-white rounded-[18px] border border-border mb-3 px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-16 shrink-0 drop-shadow-sm">
              <PlantIcon count={team.continuousTodoCount} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-[11px] font-semibold text-muted tracking-wide uppercase">
                  연속 성공 스트릭
                </p>
                <button
                  ref={infoButtonRef}
                  type="button"
                  onClick={() =>
                    setPlantInfoAnchor(
                      plantInfoAnchor
                        ? null
                        : (infoButtonRef.current?.getBoundingClientRect() ?? null)
                    )
                  }
                  className="text-muted hover:text-gray-700 transition-colors duration-150 shrink-0"
                  aria-label="성장 단계 안내"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
                    <path
                      d="M7 6.5v3M7 4.5v.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[28px] font-bold text-ink leading-none">
                  {team.continuousTodoCount}
                </span>
                <span className="text-[14px] font-semibold text-muted">일</span>
              </div>
              <span className="mt-1.5 inline-block text-[11px] font-semibold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full">
                {getPlantStageLabel(team.continuousTodoCount)}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <p className="text-[10px] text-muted">단계별 성장</p>
              <div className="flex gap-0.5 items-end">
                {[1, 4, 11, 21].map((threshold, i) => (
                  <div
                    key={threshold}
                    className={`w-1.5 rounded-sm transition-all duration-300 ${
                      team.continuousTodoCount >= threshold ? 'bg-gray-900' : 'bg-border'
                    }`}
                    style={{ height: `${10 + i * 4}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {team.inviteCode && (
          <button
            onClick={handleCopyInviteCode}
            className="w-full flex items-center justify-between bg-white rounded-[18px] border border-border px-4 py-4 mb-3 transition-all duration-200 hover:border-gray-300 hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 text-gray-500"
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
              className={`text-[12px] font-semibold shrink-0 ml-2 px-3 py-1.5 rounded-lg transition-colors duration-200 ${copyDone ? 'text-[#2d7a56] bg-[#eaf6ef]' : 'text-gray-700 bg-gray-100'}`}
            >
              {copyDone ? '복사됨 ✓' : '복사'}
            </span>
          </button>
        )}
      </div>

      <div className="px-5 py-4 border-t border-border flex flex-col gap-2">
        <button
          onClick={() => router.push(`/teams/${teamId}/todos`)}
          className="w-full py-4 bg-gray-900 text-white text-[15px] font-semibold rounded-[14px] transition-all duration-200 hover:opacity-85"
        >
          오늘의 할 일
        </button>
        <button
          onClick={() => router.push('/teams')}
          className="w-full py-4 bg-gray-100 text-gray-700 text-[15px] font-semibold rounded-[14px] transition-all duration-200 hover:bg-gray-200"
        >
          목록으로
        </button>
      </div>

      <AnimatePresence>
        {plantInfoAnchor && (
          <PlantInfoPopover
            count={team.continuousTodoCount}
            anchor={plantInfoAnchor}
            onClose={() => setPlantInfoAnchor(null)}
          />
        )}
      </AnimatePresence>

      {showStreak && (
        <StreakCelebration
          count={team.continuousTodoCount}
          teamId={teamId}
          onDismiss={() => setShowStreak(false)}
        />
      )}
    </div>
  )
}
