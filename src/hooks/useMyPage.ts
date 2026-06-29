import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/store/authStore'
import {
  deleteAccount,
  getMyInfo,
  leaveTeam,
  logoutApi,
  updateNickname,
} from '@/services/userService'
import type { MyInfoResponse, MyTeam } from '@/types/user.types'

export type MyPageConfirmState =
  | { type: 'logout' }
  | { type: 'deleteAccount' }
  | { type: 'leaveTeam'; team: MyTeam }
  | null

export function useMyPage() {
  const router = useRouter()
  const { token, user, updateUser, logout } = useAuth()

  const [myInfo, setMyInfo] = useState<MyInfoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [editingNickname, setEditingNickname] = useState(false)
  const [nicknameInput, setNicknameInput] = useState('')
  const [savingNickname, setSavingNickname] = useState(false)

  const [leavingTeamId, setLeavingTeamId] = useState<number | null>(null)
  const [confirm, setConfirm] = useState<MyPageConfirmState>(null)

  const profileImageUrl = myInfo?.profileImageUrl ?? user?.profileImageUrl ?? null
  const avatarSeed = myInfo?.nickname ?? user?.nickname ?? user?.loginId ?? ''

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
    if (!token) return
    getMyInfo(token)
      .then(setMyInfo)
      .catch(() => showToast('정보를 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false))
  }, [token])

  async function handleSaveNickname() {
    if (!token || !myInfo) return
    const trimmed = nicknameInput.trim()
    if (!trimmed) {
      showToast('닉네임을 입력해 주세요.')
      return
    }
    setSavingNickname(true)
    try {
      const updated = await updateNickname(trimmed, token)
      setMyInfo(updated)
      updateUser({ nickname: updated.nickname })
      setEditingNickname(false)
      showToast('닉네임이 수정되었습니다.')
    } catch (err) {
      showToast(err instanceof Error ? err.message : '닉네임 수정에 실패했습니다.')
    } finally {
      setSavingNickname(false)
    }
  }

  async function handleLeaveTeam(team: MyTeam) {
    setLeavingTeamId(team.teamId)
    setConfirm(null)
    try {
      await leaveTeam(team.teamId, token!)
      setMyInfo((prev) =>
        prev ? { ...prev, teams: prev.teams.filter((t) => t.teamId !== team.teamId) } : prev
      )
      showToast('그룹에서 나왔습니다.')
    } catch (err) {
      showToast(err instanceof Error ? err.message : '그룹 나가기에 실패했습니다.')
    } finally {
      setLeavingTeamId(null)
    }
  }

  async function handleLogout() {
    setConfirm(null)
    try {
      if (token) await logoutApi(token)
    } catch {
      /* proceed with local logout */
    }
    logout()
    showToast('로그아웃 되었습니다.')
    setTimeout(() => router.replace('/login'), 800)
  }

  async function handleDeleteAccount() {
    setConfirm(null)
    if (!token) return
    try {
      await deleteAccount(token)
      logout()
      showToast('탈퇴가 완료되었습니다.')
      setTimeout(() => router.replace('/login'), 800)
    } catch (err) {
      showToast(err instanceof Error ? err.message : '회원 탈퇴에 실패했습니다.')
    }
  }

  return {
    myInfo,
    loading,
    toast,
    profileImageUrl,
    avatarSeed,
    editingNickname,
    setEditingNickname,
    nicknameInput,
    setNicknameInput,
    savingNickname,
    leavingTeamId,
    confirm,
    setConfirm,
    handleSaveNickname,
    handleLeaveTeam,
    handleLogout,
    handleDeleteAccount,
  }
}
