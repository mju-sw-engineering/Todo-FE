'use client'

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
import Image from 'next/image'
import { BlobAvatar } from '@/components/ui/BlobAvatar'
import type { MyInfoResponse, MyTeam } from '@/types/user.types'

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed top-0 left-0 right-0 flex justify-center z-50 pt-4 pointer-events-none">
      <div className="max-w-97.5 w-full mx-auto px-5">
        <div className="bg-ink/90 text-white text-[13px] font-medium rounded-xl shadow-lg px-4 py-2.5 text-center">
          {message}
        </div>
      </div>
    </div>
  )
}

export default function MyPage() {
  const { token, user, updateUser, logout } = useAuth()
  const router = useRouter()

  const [myInfo, setMyInfo] = useState<MyInfoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [editingNickname, setEditingNickname] = useState(false)
  const [nicknameInput, setNicknameInput] = useState('')
  const [savingNickname, setSavingNickname] = useState(false)

  const [leavingTeamId, setLeavingTeamId] = useState<number | null>(null)

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
      const message = err instanceof Error ? err.message : '닉네임 수정에 실패했습니다.'
      showToast(message)
    } finally {
      setSavingNickname(false)
    }
  }

  async function handleLeaveTeam(team: MyTeam) {
    if (!token) return
    if (!window.confirm(`'${team.teamName}' 그룹에서 나가시겠습니까?`)) return
    setLeavingTeamId(team.teamId)
    try {
      await leaveTeam(team.teamId, token)
      setMyInfo((prev) =>
        prev ? { ...prev, teams: prev.teams.filter((t) => t.teamId !== team.teamId) } : prev
      )
      showToast('그룹에서 나왔습니다.')
    } catch (err) {
      const message = err instanceof Error ? err.message : '그룹 나가기에 실패했습니다.'
      showToast(message)
    } finally {
      setLeavingTeamId(null)
    }
  }

  async function handleLogout() {
    if (!window.confirm('로그아웃 하시겠습니까?')) return

    try {
      if (token) {
        await logoutApi(token)
      }
    } catch {
      // 토큰이 없거나 API 실패해도 클라이언트 측 로그아웃 진행
    }

    try {
      logout()
    } catch {
      showToast('로그아웃 처리 중 문제가 발생했습니다.')
      return
    }

    showToast('로그아웃 되었습니다.')
    setTimeout(() => router.replace('/login'), 800)
  }

  async function handleDeleteAccount() {
    if (!token) return
    if (!window.confirm('정말 탈퇴하시겠습니까? 계정과 모든 데이터가 삭제됩니다.')) return
    if (!window.confirm('탈퇴 후에는 복구할 수 없습니다. 계속하시겠습니까?')) return

    try {
      await deleteAccount(token)
      logout()
      showToast('탈퇴가 완료되었습니다.')
      setTimeout(() => router.replace('/login'), 800)
    } catch (err) {
      const message = err instanceof Error ? err.message : '회원 탈퇴에 실패했습니다.'
      showToast(message)
    }
  }

  const profileImageUrl = myInfo?.profileImageUrl ?? user?.profileImageUrl ?? null
  const avatarSeed = myInfo?.nickname ?? user?.nickname ?? user?.loginId ?? ''

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      {toast && <Toast message={toast} />}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* 프로필 카드 */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden shrink-0">
              {profileImageUrl ? (
                <Image
                  src={profileImageUrl}
                  alt="프로필 사진"
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              ) : (
                <BlobAvatar seed={avatarSeed} size={56} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-muted mb-0.5">닉네임</p>
              {editingNickname ? (
                <div className="flex items-center gap-2">
                  <input
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveNickname()}
                    className="flex-1 min-w-0 border border-border rounded-lg px-3 py-1.5 text-[14px] text-ink focus:outline-none focus:border-primary"
                    autoFocus
                    maxLength={20}
                    disabled={savingNickname}
                  />
                  <button
                    onClick={handleSaveNickname}
                    disabled={savingNickname}
                    className="px-3 py-1.5 text-[13px] font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 shrink-0"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => setEditingNickname(false)}
                    disabled={savingNickname}
                    className="px-3 py-1.5 text-[13px] font-medium text-muted hover:text-ink rounded-lg transition-colors shrink-0"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-[16px] font-semibold text-ink truncate">
                    {myInfo?.nickname ?? user?.nickname}
                  </p>
                  <button
                    onClick={() => {
                      setNicknameInput(myInfo?.nickname ?? user?.nickname ?? '')
                      setEditingNickname(true)
                    }}
                    className="ml-2 px-3 py-1 text-[12px] font-semibold text-primary bg-primary-light hover:bg-[#e0daf8] rounded-lg transition-colors shrink-0"
                  >
                    수정
                  </button>
                </div>
              )}
            </div>
          </div>

          {myInfo?.loginId && (
            <p className="mt-3 text-[12px] text-muted">아이디: {myInfo.loginId}</p>
          )}
        </div>

        {/* 내 그룹 */}
        <div>
          <h2 className="text-[15px] font-bold text-ink mb-3">내 그룹</h2>
          {!myInfo || myInfo.teams.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-5 text-center text-[14px] text-muted">
              소속된 그룹이 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {myInfo.teams.map((team) => (
                <div
                  key={team.teamId}
                  className="bg-white rounded-2xl border border-border px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {team.teamImageUrl ? (
                      <Image
                        src={team.teamImageUrl}
                        alt={team.teamName}
                        width={36}
                        height={36}
                        className="rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                        <span className="text-primary text-[12px] font-bold">
                          {team.teamName.trim().slice(0, 2)}
                        </span>
                      </div>
                    )}
                    <span className="text-[15px] font-medium text-ink truncate">
                      {team.teamName}
                    </span>
                  </div>
                  <button
                    onClick={() => handleLeaveTeam(team)}
                    disabled={leavingTeamId === team.teamId}
                    className="px-3 py-1.5 text-[12px] font-semibold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors shrink-0 disabled:opacity-50"
                  >
                    {leavingTeamId === team.teamId ? '나가는 중…' : '나가기'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-xl border border-border text-ink text-[15px] font-medium hover:bg-gray-50 transition-colors"
          >
            로그아웃
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full py-2 text-[13px] text-red-400 hover:text-red-500 transition-colors"
          >
            회원 탈퇴
          </button>
        </div>
      </div>
    </>
  )
}
