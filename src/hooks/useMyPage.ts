import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { reauthenticate, reauthenticateWithApple } from '@/services/authService'
import { useAuth } from '@/store/authStore'
import { ApiError } from '@/lib/apiClient'
import { getErrorMessage } from '@/lib/apiError'
import { AppleSignInCancelledError, requestAppleCredential } from '@/lib/appleAuth'
import { usePresignedUpload } from '@/hooks/usePresignedUpload'
import {
  deleteAccount,
  getMyInfo,
  logoutApi,
  updateNickname,
  updatePassword,
  updateProfileImage,
} from '@/services/userService'
import type { MyInfoResponse } from '@/types/user.types'

export type MyPageConfirmState = { type: 'logout' } | { type: 'deleteAccount' } | null

type DeleteAccountPhase = 'reauth' | 'withdrawal'

function deleteAccountErrorMessage(error: unknown, phase: DeleteAccountPhase): string {
  // 사용자가 애플 시트를 닫은 것은 실패가 아니다. 에러 문구 없이 조용히 끝낸다.
  if (error instanceof AppleSignInCancelledError) return ''

  if (!(error instanceof ApiError)) {
    return '회원 탈퇴에 실패했습니다.'
  }

  if (phase === 'reauth') {
    if (error.status === 429) return '본인 확인 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.'
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

  const [confirm, setConfirm] = useState<MyPageConfirmState>(null)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null)
  const [deletingAccount, setDeletingAccount] = useState(false)

  const { upload: uploadProfileImage, isUploading: uploadingProfileImage } = usePresignedUpload({
    type: 'PROFILE',
    token: token ?? undefined,
  })

  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // 애플 계정은 비밀번호가 없어 탈퇴 재인증 방식이 다르다.
  //
  // provider를 모르는 상태(getMyInfo 실패)를 그냥 false로 접으면 애플 계정이 비밀번호
  // 흐름으로 들어가 탈퇴가 막힌다. 모르는 상태를 따로 표현해 탈퇴를 아예 잠근다.
  const providerKnown = myInfo !== null
  const isAppleAccount = myInfo?.provider === 'APPLE'

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

  async function handleProfileImageChange(file: File) {
    if (!token) return
    try {
      const profileImageKey = await uploadProfileImage(file)
      const updated = await updateProfileImage(profileImageKey, token)
      setMyInfo(updated)
      updateUser({ profileImageUrl: updated.profileImageUrl })
      showToast('프로필 사진이 변경되었습니다.')
    } catch (err) {
      showToast(err instanceof Error ? err.message : '프로필 사진 변경에 실패했습니다.')
    }
  }

  async function handleChangePassword(
    currentPassword: string,
    newPassword: string,
    newPasswordConfirm: string
  ): Promise<boolean> {
    if (!token) return false
    setPasswordError(null)
    if (newPassword !== newPasswordConfirm) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.')
      return false
    }
    setChangingPassword(true)
    try {
      await updatePassword({ currentPassword, newPassword, newPasswordConfirm }, token)
      showToast('비밀번호가 변경되었습니다.')
      return true
    } catch (err) {
      setPasswordError(getErrorMessage(err, '비밀번호 변경에 실패했습니다.'))
      return false
    } finally {
      setChangingPassword(false)
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

  /**
   * 탈퇴 전 재인증.
   *
   * 애플 계정은 비밀번호가 없어 `/api/auth/reauth`가 400으로 거절한다. 대신 애플 시트를
   * 새로 통과했다는 증거를 보낸다 — 시트가 Face ID를 거치므로 더 약하지 않다.
   */
  async function requestReauthToken(): Promise<string> {
    if (!token) throw new Error('로그인이 필요합니다.')

    if (isAppleAccount) {
      const credential = await requestAppleCredential()
      const { reauthToken } = await reauthenticateWithApple(
        {
          identityToken: credential.identityToken,
          nonce: credential.nonce,
          purpose: 'WITHDRAWAL',
        },
        token
      )
      return reauthToken
    }

    const { reauthToken } = await reauthenticate(
      { password: deletePassword, purpose: 'WITHDRAWAL' },
      token
    )
    return reauthToken
  }

  async function handleDeleteAccount() {
    if (!token || deletingAccount || !providerKnown) return
    // 애플 계정은 입력란이 없으므로 비밀번호를 요구하지 않는다.
    if (!isAppleAccount && !deletePassword) return

    setDeletingAccount(true)
    setDeleteAccountError(null)
    let phase: DeleteAccountPhase = 'reauth'

    try {
      const reauthToken = await requestReauthToken()
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
    confirm,
    setConfirm,
    deletePassword,
    setDeletePassword,
    deleteAccountError,
    deletingAccount,
    isAppleAccount,
    providerKnown,
    uploadingProfileImage,
    changingPassword,
    passwordError,
    setPasswordError,
    handleSaveNickname,
    handleProfileImageChange,
    handleChangePassword,
    handleLogout,
    openDeleteAccountConfirm,
    closeDeleteAccountConfirm,
    handleDeleteAccount,
  }
}
