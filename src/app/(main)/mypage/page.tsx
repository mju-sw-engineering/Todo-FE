'use client'

import { AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { FiCamera } from 'react-icons/fi'
import { useMyPage } from '@/hooks/useMyPage'
import { BlobAvatar } from '@/components/ui/BlobAvatar'
import { Toast } from '@/components/ui/Toast'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageLoader } from '@/components/ui/PageLoader'

export default function MyPage() {
  const {
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
  } = useMyPage()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [passwordOpen, setPasswordOpen] = useState(false)
  const [currentPasswordInput, setCurrentPasswordInput] = useState('')
  const [newPasswordInput, setNewPasswordInput] = useState('')
  const [newPasswordConfirmInput, setNewPasswordConfirmInput] = useState('')

  function closePasswordForm() {
    setPasswordOpen(false)
    setCurrentPasswordInput('')
    setNewPasswordInput('')
    setNewPasswordConfirmInput('')
    setPasswordError(null)
  }

  async function submitPasswordChange() {
    const ok = await handleChangePassword(
      currentPasswordInput,
      newPasswordInput,
      newPasswordConfirmInput
    )
    if (ok) closePasswordForm()
  }

  if (loading) return <PageLoader />

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {toast && <Toast message={toast} />}

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-8 flex flex-col gap-4 animate-fade-up">
        <div className="mb-2">
          <h1 className="text-[20px] font-black text-ink leading-tight">마이페이지</h1>
          <p className="text-[12px] text-muted mt-0.5">내 정보 및 그룹 관리</p>
        </div>

        <div className="bg-white rounded-[18px] border border-border p-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingProfileImage}
              className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border border-border disabled:opacity-60"
              aria-label="프로필 사진 변경"
            >
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
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/35 transition-colors">
                <FiCamera
                  size={16}
                  className="text-white opacity-0 hover:opacity-100 transition-opacity"
                />
              </span>
              {uploadingProfileImage && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </span>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (file) handleProfileImageChange(file)
              }}
            />

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
                    className="flex-1 min-w-0 border-[1.5px] border-border rounded-lg px-3 py-1.5 text-[16px] text-ink bg-white outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_3px_rgba(102,154,255,0.15)]"
                    autoFocus
                    maxLength={20}
                    disabled={savingNickname}
                  />
                  <button
                    onClick={handleSaveNickname}
                    disabled={savingNickname}
                    className="px-3.5 py-2.5 text-[13px] font-semibold text-white bg-primary hover:opacity-85 rounded-lg transition-opacity disabled:opacity-50 shrink-0"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => setEditingNickname(false)}
                    disabled={savingNickname}
                    className="px-3.5 py-2.5 text-[13px] font-medium text-muted hover:text-ink transition-colors shrink-0"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[16px] font-bold text-ink truncate">{myInfo?.nickname}</p>
                  <button
                    onClick={() => {
                      setNicknameInput(myInfo?.nickname ?? '')
                      setEditingNickname(true)
                    }}
                    className="px-3.5 py-2.5 text-[12px] font-semibold text-neutral-100 bg-neutral-30 hover:bg-neutral-40 rounded-lg transition-colors shrink-0"
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

        {providerKnown && !isAppleAccount && (
          <div
            className={`bg-white rounded-[18px] border border-border ${passwordOpen ? '' : 'overflow-hidden'}`}
          >
            <button
              onClick={() => (passwordOpen ? closePasswordForm() : setPasswordOpen(true))}
              className="w-full flex items-center justify-between px-4 py-4 transition-colors hover:bg-gray-50"
            >
              <p className="text-[14px] font-semibold text-ink">비밀번호 변경</p>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${passwordOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {passwordOpen && (
              <div className="border-t border-border px-4 py-4 flex flex-col gap-3">
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  placeholder="현재 비밀번호"
                  disabled={changingPassword}
                  className="min-h-12"
                />
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="새 비밀번호"
                  disabled={changingPassword}
                  className="min-h-12"
                />
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={newPasswordConfirmInput}
                  onChange={(e) => setNewPasswordConfirmInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitPasswordChange()}
                  placeholder="새 비밀번호 확인"
                  disabled={changingPassword}
                  className="min-h-12"
                />
                {passwordError && (
                  <p className="text-[12px] font-semibold text-status-red">{passwordError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={submitPasswordChange}
                    disabled={
                      changingPassword ||
                      !currentPasswordInput ||
                      !newPasswordInput ||
                      !newPasswordConfirmInput
                    }
                    className="flex-1 px-4 py-2.5 bg-primary text-white text-[13px] font-semibold rounded-xl disabled:opacity-50 transition-opacity hover:opacity-85"
                  >
                    {changingPassword ? '변경 중...' : '변경하기'}
                  </button>
                  <button
                    onClick={closePasswordForm}
                    disabled={changingPassword}
                    className="px-4 py-2.5 text-[13px] font-medium text-muted hover:text-ink transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-2 flex flex-col gap-3">
          <Link
            href="/privacy"
            className="text-[13px] text-muted hover:text-ink transition-colors px-1"
          >
            개인정보처리방침
          </Link>
          <Button variant="danger" size="lg" onClick={openDeleteAccountConfirm}>
            회원 탈퇴
          </Button>
          <Button variant="secondary" size="lg" onClick={() => setConfirm({ type: 'logout' })}>
            로그아웃
          </Button>
        </div>
      </div>

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
        {confirm?.type === 'deleteAccount' && (
          <ConfirmModal
            title="회원 탈퇴"
            message="계정과 모든 데이터가 삭제되며 복구할 수 없습니다. 정말 탈퇴하시겠습니까?"
            confirmLabel="탈퇴하기"
            confirmDanger
            confirmDisabled={!providerKnown || (!isAppleAccount && !deletePassword)}
            confirmPending={deletingAccount}
            onConfirm={handleDeleteAccount}
            onCancel={closeDeleteAccountConfirm}
          >
            {!providerKnown ? (
              // 계정 정보를 못 불러오면 어떤 방식으로 본인 확인을 해야 할지 알 수 없다.
              <p className="text-left text-[12px] text-muted">
                계정 정보를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.
              </p>
            ) : isAppleAccount ? (
              // 애플 계정은 비밀번호가 없다. 탈퇴하기를 누르면 애플 인증 시트로 본인을 확인한다.
              <p className="text-left text-[12px] text-muted">
                탈퇴하기를 누르면 Apple로 본인 확인을 진행합니다.
              </p>
            ) : (
              <>
                <label
                  htmlFor="delete-account-password"
                  className="block text-left text-[12px] font-semibold text-ink mb-2"
                >
                  현재 비밀번호
                </label>
                <input
                  id="delete-account-password"
                  type="password"
                  value={deletePassword}
                  onChange={(event) => {
                    setDeletePassword(event.target.value)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && deletePassword && !deletingAccount) {
                      handleDeleteAccount()
                    }
                  }}
                  autoComplete="current-password"
                  autoFocus
                  disabled={deletingAccount}
                  placeholder="비밀번호를 입력해 주세요"
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-[16px] text-ink outline-none transition-colors focus:border-status-red disabled:bg-neutral-30"
                />
              </>
            )}
            {deleteAccountError && (
              <p role="alert" className="mt-2 text-left text-[12px] text-status-red">
                {deleteAccountError}
              </p>
            )}
          </ConfirmModal>
        )}
      </AnimatePresence>
    </div>
  )
}
