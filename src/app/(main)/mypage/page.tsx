'use client'

import { AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useMyPage } from '@/hooks/useMyPage'
import { BlobAvatar } from '@/components/ui/BlobAvatar'
import { Toast } from '@/components/ui/Toast'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Button } from '@/components/ui/Button'
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
    leavingTeamId,
    confirm,
    setConfirm,
    handleSaveNickname,
    handleLeaveTeam,
    handleLogout,
    handleDeleteAccount,
  } = useMyPage()

  if (loading) return <PageLoader />

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {toast && <Toast message={toast} />}

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-8 flex flex-col gap-4 animate-fade-up">
        <div className="mb-2">
          <h1 className="text-[20px] font-black text-ink leading-tight">마이페이지</h1>
          <p className="text-[12px] text-muted mt-0.5">내 정보 및 그룹 관리</p>
        </div>

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
                  <p className="text-[16px] font-bold text-ink truncate">{myInfo?.nickname}</p>
                  <button
                    onClick={() => {
                      setNicknameInput(myInfo?.nickname ?? '')
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

        <div className="pt-2">
          <Button variant="danger" size="sm" onClick={() => setConfirm({ type: 'deleteAccount' })}>
            회원 탈퇴
          </Button>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-border">
        <Button variant="secondary" size="lg" onClick={() => setConfirm({ type: 'logout' })}>
          로그아웃
        </Button>
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
    </div>
  )
}
