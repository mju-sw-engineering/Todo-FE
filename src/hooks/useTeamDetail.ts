import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ApiError } from '@/lib/apiClient'
import { getErrorMessage } from '@/lib/apiError'
import { getTeamById, leaveTeam, removeMember } from '@/services/teamService'
import { useAuth } from '@/store/authStore'
import type { TeamDetailResponse, TeamMember } from '@/types/team.types'

export function useTeamDetail(teamId: number) {
  const router = useRouter()
  const { token, user } = useAuth()

  const [team, setTeam] = useState<TeamDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [kickTarget, setKickTarget] = useState<TeamMember | null>(null)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentUserId = user?.userId
  const myRole = team?.members.find((m) => m.userId === currentUserId)?.role

  useEffect(() => {
    if (!token || !teamId) return
    getTeamById(teamId, token)
      .then((data) => {
        setTeam(data)
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 403) router.replace('/teams')
      })
      .finally(() => setIsLoading(false))
  }, [token, teamId, router])

  async function handleKickMember() {
    if (!kickTarget || !token) return
    setIsSubmitting(true)
    try {
      await removeMember(teamId, kickTarget.userId, token)
      setTeam((prev) =>
        prev
          ? {
              ...prev,
              members: prev.members.filter((m) => m.userId !== kickTarget.userId),
              memberCount: prev.memberCount - 1,
            }
          : prev
      )
      setKickTarget(null)
    } catch (err) {
      setKickTarget(null)
      toast.error(
        getErrorMessage(err, '권한 이양 중 문제가 발생했습니다', {
          401: '로그인이 만료되었습니다',
          403: '권한이 없습니다',
        })
      )
      if (err instanceof ApiError && err.status === 401)
        setTimeout(() => router.push('/login'), 1500)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleLeaveTeam() {
    if (!token) return
    setIsSubmitting(true)
    try {
      await leaveTeam(teamId, token)
      setShowLeaveConfirm(false)
      router.replace('/teams')
    } catch (err) {
      setShowLeaveConfirm(false)
      toast.error(
        getErrorMessage(err, '권한 이양 중 문제가 발생했습니다', {
          401: '로그인이 만료되었습니다',
          403: '권한이 없습니다',
        })
      )
      if (err instanceof ApiError && err.status === 401)
        setTimeout(() => router.push('/login'), 1500)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    team,
    isLoading,
    kickTarget,
    setKickTarget,
    showLeaveConfirm,
    setShowLeaveConfirm,
    isSubmitting,
    showToast: toast,
    currentUserId,
    myRole,
    handleKickMember,
    handleLeaveTeam,
  }
}
