'use client'

import { useParams, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useTeamDetail } from '@/hooks/useTeamDetail'
import { Toast } from '@/components/ui/Toast'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { TeamMembersCard } from './components/TeamMembersCard'
import { StreakCard } from './components/StreakCard'
import { TeamInviteSection } from './components/TeamInviteSection'
import { StreakCelebration } from './components/StreakCelebration'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/PageLoader'
import { useAuth } from '@/store/authStore'

export default function TeamDetailPage() {
  const router = useRouter()
  const params = useParams()
  const teamId = Number(params.teamId)
  const { token } = useAuth()

  const {
    team,
    isLoading,
    showStreak,
    setShowStreak,
    actionError,
    kickTarget,
    setKickTarget,
    showLeaveConfirm,
    setShowLeaveConfirm,
    isSubmitting,
    toast,
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
      {toast && <Toast message={toast} />}

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-6">
          <BackButton onClick={() => router.back()} />
          <div className="min-w-0">
            <h1 className="text-[20px] font-black text-ink leading-tight truncate">
              {team.teamName}
            </h1>
            <p className="text-[12px] text-muted mt-0.5">팀 정보</p>
          </div>
        </div>

        <AnimatePresence>
          {actionError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-3 px-4 py-3 bg-red-50 border border-red-200 rounded-[14px] text-[13px] font-semibold text-red-600"
              onAnimationComplete={() => setTimeout(() => {}, 3000)}
            >
              {actionError}
            </motion.div>
          )}
        </AnimatePresence>

        <TeamMembersCard
          team={team}
          currentUserId={currentUserId ?? undefined}
          myRole={myRole}
          isSubmitting={isSubmitting}
          onKick={setKickTarget}
        />

        <StreakCard continuousTodoCount={team.continuousTodoCount} />

        {token && (
          <TeamInviteSection
            teamId={teamId}
            token={token}
            inviteCode={team.inviteCode}
            onToast={showToast}
          />
        )}

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

      <div className="px-5 py-4 border-t border-border flex flex-col gap-2">
        <Button size="lg" onClick={() => router.push(`/teams/${teamId}/todos`)}>
          오늘의 할 일
        </Button>
        <Button variant="secondary" size="lg" onClick={() => router.push('/teams')}>
          목록으로
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
