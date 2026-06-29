import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApiError } from '@/lib/apiClient'
import { getTeamById, leaveTeam, removeMember } from '@/services/teamService'
import { useAuth } from '@/store/authStore'
import { isStreakSkippedToday } from '@/components/ui/StreakCelebration'
import type { TeamDetailResponse, TeamMember } from '@/types/team.types'

export function useTeamDetail(teamId: number) {
  const router = useRouter()
  const { token, user } = useAuth()

  const [team, setTeam] = useState<TeamDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showStreak, setShowStreak] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [kickTarget, setKickTarget] = useState<TeamMember | null>(null)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentUserId = user?.userId
  const myRole = team?.members.find((m) => m.userId === currentUserId)?.role

  function showToast(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = setTimeout(() => setToast(null), 2500)
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!token || !teamId) return
    getTeamById(teamId, token)
      .then((data) => {
        setTeam(data)
        if (data.continuousTodoCount > 0 && !isStreakSkippedToday(teamId)) setShowStreak(true)
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 403) router.replace('/teams')
      })
      .finally(() => setIsLoading(false))
  }, [token, teamId, router])

  async function handleKickMember() {
    if (!kickTarget || !token) return
    setIsSubmitting(true)
    setActionError(null)
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
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setActionError('로그인이 만료되었습니다')
          setTimeout(() => router.push('/login'), 1500)
        } else if (err.status === 403) setActionError('권한이 없습니다')
        else setActionError('권한 이양 중 문제가 발생했습니다')
      } else {
        setActionError('권한 이양 중 문제가 발생했습니다')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleLeaveTeam() {
    if (!token) return
    setIsSubmitting(true)
    setActionError(null)
    try {
      await leaveTeam(teamId, token)
      setShowLeaveConfirm(false)
      router.replace('/teams')
    } catch (err) {
      setShowLeaveConfirm(false)
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setActionError('로그인이 만료되었습니다')
          setTimeout(() => router.push('/login'), 1500)
        } else if (err.status === 403) setActionError('권한이 없습니다')
        else setActionError('권한 이양 중 문제가 발생했습니다')
      } else {
        setActionError('권한 이양 중 문제가 발생했습니다')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
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
  }
}
