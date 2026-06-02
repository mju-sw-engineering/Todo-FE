'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
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
        <div className="bg-gray-900/90 text-white text-[13px] font-medium rounded-xl shadow-lg px-4 py-2.5 text-center">
          {message}
        </div>
      </div>
    </div>
  )
}

interface ConfirmModalProps {
  title: string
  message: string
  confirmLabel: string
  confirmDanger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmDanger,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-6 px-4">
      <div className="fixed inset-0 bg-black/40" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ type: 'spring', damping: 26, stiffness: 380, mass: 0.5 }}
        className="relative w-full max-w-sm bg-white rounded-[22px] shadow-[0_8px_40px_rgba(0,0,0,0.18)] p-6"
      >
        <p className="text-[16px] font-bold text-ink mb-1">{title}</p>
        <p className="text-[13px] text-muted leading-relaxed mb-5">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-[14px] font-semibold text-gray-700 transition-colors hover:bg-gray-200"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-xl text-[14px] font-semibold text-white transition-opacity hover:opacity-85 ${
              confirmDanger ? 'bg-red-500' : 'bg-gray-900'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

type ConfirmState =
  | { type: 'logout' }
  | { type: 'deleteAccount' }
  | { type: 'leaveTeam'; team: MyTeam }
  | null

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
  const [confirm, setConfirm] = useState<ConfirmState>(null)

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
    setLeavingTeamId(team.teamId)
    setConfirm(null)
    try {
      await leaveTeam(team.teamId, token!)
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
    setConfirm(null)
    try {
      if (token) await logoutApi(token)
    } catch {
      // 클라이언트 측 로그아웃 계속 진행
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
      const message = err instanceof Error ? err.message : '회원 탈퇴에 실패했습니다.'
      showToast(message)
    }
  }

  const profileImageUrl = myInfo?.profileImageUrl ?? user?.profileImageUrl ?? null
  const avatarSeed = myInfo?.nickname ?? user?.nickname ?? user?.loginId ?? ''

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      {toast && <Toast message={toast} />}

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-8 flex flex-col gap-4 animate-fade-up">
        {/* 헤더 */}
        <div className="mb-2">
          <h1 className="text-[20px] font-black text-ink leading-tight">마이페이지</h1>
          <p className="text-[12px] text-muted mt-0.5">내 정보 및 그룹 관리</p>
        </div>

        {/* 프로필 카드 */}
        <div className="bg-white rounded-[18px] border border-border p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-border">
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
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
                닉네임
              </p>
              {editingNickname ? (
                <div className="flex items-center gap-2">
                  <input
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveNickname()}
                    className="flex-1 min-w-0 border border-border rounded-lg px-3 py-1.5 text-[14px] text-ink focus:outline-none focus:border-gray-900 transition-colors"
                    autoFocus
                    maxLength={20}
                    disabled={savingNickname}
                  />
                  <button
                    onClick={handleSaveNickname}
                    disabled={savingNickname}
                    className="px-3 py-1.5 text-[13px] font-semibold text-white bg-gray-900 hover:opacity-85 rounded-lg transition-opacity disabled:opacity-50 shrink-0"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => setEditingNickname(false)}
                    disabled={savingNickname}
                    className="px-3 py-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-700 rounded-lg transition-colors shrink-0"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[16px] font-bold text-ink truncate">
                    {myInfo?.nickname ?? user?.nickname}
                  </p>
                  <button
                    onClick={() => {
                      setNicknameInput(myInfo?.nickname ?? user?.nickname ?? '')
                      setEditingNickname(true)
                    }}
                    className="px-3 py-1.5 text-[12px] font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors shrink-0"
                  >
                    수정
                  </button>
                </div>
              )}
            </div>
          </div>

          {myInfo?.loginId && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                아이디
              </p>
              <p className="text-[14px] font-medium text-ink mt-0.5">{myInfo.loginId}</p>
            </div>
          )}
        </div>

        {/* 내 그룹 */}
        <div>
          <p className="text-[12px] font-semibold text-muted uppercase tracking-wider mb-3 px-1">
            내 그룹
          </p>
          {!myInfo || myInfo.teams.length === 0 ? (
            <div className="bg-white rounded-[18px] border border-border px-4 py-5 text-center text-[14px] text-muted">
              소속된 그룹이 없습니다.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {myInfo.teams.map((team) => (
                <div
                  key={team.teamId}
                  className="bg-white rounded-[18px] border border-border px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {team.teamImageUrl ? (
                      <Image
                        src={team.teamImageUrl}
                        alt={team.teamName}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover shrink-0 border border-border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <span className="text-gray-700 text-[13px] font-bold">
                          {team.teamName.trim().slice(0, 2)}
                        </span>
                      </div>
                    )}
                    <span className="text-[14px] font-semibold text-ink truncate">
                      {team.teamName}
                    </span>
                  </div>
                  <button
                    onClick={() => setConfirm({ type: 'leaveTeam', team })}
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

        {/* 계정 액션 */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => setConfirm({ type: 'logout' })}
            className="w-full py-4 bg-gray-100 text-gray-700 text-[15px] font-semibold rounded-[14px] transition-colors hover:bg-gray-200"
          >
            로그아웃
          </button>
          <button
            onClick={() => setConfirm({ type: 'deleteAccount' })}
            className="w-full py-3 text-[14px] font-semibold text-red-500 hover:text-red-600 transition-colors"
          >
            회원 탈퇴
          </button>
        </div>
      </div>

      {/* Confirm modals */}
      <AnimatePresence>
        {confirm?.type === 'logout' && (
          <ConfirmModal
            title="로그아웃"
            message="로그아웃 하시겠습니까?"
            confirmLabel="로그아웃"
            onConfirm={handleLogout}
            onCancel={() => setConfirm(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirm?.type === 'leaveTeam' && (
          <ConfirmModal
            title={`'${confirm.team.teamName}' 나가기`}
            message="이 그룹에서 나가시겠습니까?"
            confirmLabel="나가기"
            confirmDanger
            onConfirm={() => handleLeaveTeam(confirm.team)}
            onCancel={() => setConfirm(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirm?.type === 'deleteAccount' && (
          <ConfirmModal
            title="회원 탈퇴"
            message="계정과 모든 데이터가 삭제되며 복구할 수 없습니다. 정말 탈퇴하시겠습니까?"
            confirmLabel="탈퇴하기"
            confirmDanger
            onConfirm={handleDeleteAccount}
            onCancel={() => setConfirm(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
