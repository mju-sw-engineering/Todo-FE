'use client'

import { useParams, useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { useTeamDetail } from '@/hooks/useTeamDetail'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { TeamMembersCard } from '../components/TeamMembersCard'
import { FeedVisibilityCard } from '../components/FeedVisibilityCard'
import { TeamInviteSection } from '../components/TeamInviteSection'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/PageLoader'
import { useAuth } from '@/store/authStore'

/** 팀 관리 화면 — 팀원·초대·공개 설정·탈퇴. 할 일은 팀 홈(/teams/[teamId]/todos)이 담당한다. */
export default function TeamSettingsPage() {
  const router = useRouter()
  const params = useParams()
  const teamId = Number(params.teamId)
  const { token } = useAuth()

  const {
    team,
    isLoading,
    kickTarget,
    setKickTarget,
    showLeaveConfirm,
    setShowLeaveConfirm,
    isSubmitting,
    showToast,
    currentUserId,
    myRole,
    handleKickMember,
    handleLeaveTeam,
  } = useTeamDetail(teamId)

  if (isLoading) return <PageLoader />
  if (!team) return null

  const leaveConfirmMessage =
    myRole === 'LEADER' && team.memberCount > 1
      ? '팀장 권한이 다른 팀원에게 자동으로 이양됩니다. 정말 탈퇴하시겠습니까?'
      : myRole === 'LEADER' && team.memberCount === 1
        ? '혼자 남은 팀장이 탈퇴하면 팀 데이터가 삭제됩니다. 정말 탈퇴하시겠습니까?'
        : '팀에서 탈퇴하시겠습니까?'

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-fade-up">
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-6">
        <div className="flex items-center gap-2 mb-6">
          <BackButton onClick={() => router.back()} />
          <div className="min-w-0">
            <h1 className="text-[20px] font-black text-ink leading-tight truncate">
              {team.teamName}
            </h1>
            <p className="text-[12px] text-muted mt-0.5">팀 설정</p>
          </div>
        </div>

        <TeamMembersCard
          team={team}
          currentUserId={currentUserId ?? undefined}
          myRole={myRole}
          isSubmitting={isSubmitting}
          onKick={setKickTarget}
        />

        <FeedVisibilityCard isLeader={myRole === 'LEADER'} />

        {token && <TeamInviteSection teamId={teamId} token={token} onToast={showToast} />}

        <Button
          variant="danger"
          size="sm"
          onClick={() => setShowLeaveConfirm(true)}
          disabled={isSubmitting}
          className="mt-3 w-full"
        >
          팀 탈퇴
        </Button>
      </div>

      <AnimatePresence>
        {kickTarget && (
          <ConfirmModal
            title={`${kickTarget.nickname}님을 팀에서 내보낼까요?`}
            message="해당 팀원이 팀에서 제외됩니다."
            confirmLabel="내보내기"
            confirmDanger
            onConfirm={handleKickMember}
            onCancel={() => setKickTarget(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLeaveConfirm && (
          <ConfirmModal
            title="팀 탈퇴"
            message={leaveConfirmMessage}
            confirmLabel="탈퇴하기"
            confirmDanger
            onConfirm={handleLeaveTeam}
            onCancel={() => setShowLeaveConfirm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
