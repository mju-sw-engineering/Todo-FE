import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { reauthenticate } from '@/services/authService'
import { useAuth } from '@/store/authStore'
import { ApiError } from '@/lib/apiClient'
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

type DeleteAccountPhase = 'reauth' | 'withdrawal'

function deleteAccountErrorMessage(error: unknown, phase: DeleteAccountPhase): string {
  if (!(error instanceof ApiError)) {
    return '회원 탈퇴에 실패했습니다.'
  }

  if (phase === 'reauth') {
    if (error.status === 429)
      return '비밀번호 확인 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.'
    if (error.status === 401) return error.message
  }

  if (phase === 'withdrawal') {
    if (error.status === 400) return error.message
    if (error.status === 401) return '재인증이 만료되었거나 유효하지 않습니다. 다시 시도해 주세요.'
  }

  return error.message
}

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
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null)
  const [deletingAccount, setDeletingAccount] = useState(false)

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

  function openDeleteAccountConfirm() {
    setDeletePassword('')
    setDeleteAccountError(null)
    setConfirm({ type: 'deleteAccount' })
  }

  function closeDeleteAccountConfirm() {
    if (deletingAccount) return
    setDeletePassword('')
    setDeleteAccountError(null)
    setConfirm(null)
  }

  async function handleDeleteAccount() {
    if (!token || !deletePassword || deletingAccount) return

    setDeletingAccount(true)
    setDeleteAccountError(null)
    let phase: DeleteAccountPhase = 'reauth'

    try {
      const { reauthToken } = await reauthenticate(
        { password: deletePassword, purpose: 'WITHDRAWAL' },
        token
      )
      phase = 'withdrawal'
      await deleteAccount(reauthToken, token)
      setConfirm(null)
      setDeletePassword('')
      logout()
      showToast('탈퇴가 완료되었습니다.')
      setTimeout(() => router.replace('/login'), 800)
    } catch (err) {
      setDeleteAccountError(deleteAccountErrorMessage(err, phase))
    } finally {
      setDeletingAccount(false)
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
    deletePassword,
    setDeletePassword,
    deleteAccountError,
    deletingAccount,
    handleSaveNickname,
    handleLeaveTeam,
    handleLogout,
    openDeleteAccountConfirm,
    closeDeleteAccountConfirm,
    handleDeleteAccount,
  }
}
