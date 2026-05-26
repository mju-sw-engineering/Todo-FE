'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { TeamAvatar } from '@/components/ui/TeamAvatar'
import { ApiError } from '@/lib/apiClient'
import { getTeams, joinTeam } from '@/services/teamService'
import { useAuth } from '@/store/authStore'
import type { TeamListItem } from '@/types/team.types'

interface JoinModalProps {
  token: string
  onClose: () => void
  onSuccess: (teamId: number) => void
}

function JoinModal({ token, onClose, onSuccess }: JoinModalProps) {
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useLayoutEffect(() => {
    const scrollY = window.scrollY
    const body = document.body
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.overflow = 'hidden'
    return () => {
      body.style.position = ''
      body.style.top = ''
      body.style.left = ''
      body.style.right = ''
      body.style.overflow = ''
      window.scrollTo(0, scrollY)
    }
  }, [])

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const result = await joinTeam({ inviteCode: inviteCode.trim().toUpperCase() }, token)
      onSuccess(result.teamId)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) setError('존재하지 않는 초대 코드입니다.')
        else if (err.status === 409) setError('이미 참여한 팀입니다.')
        else setError(err.message)
      } else {
        setError('팀 참여 중 오류가 발생했습니다.')
      }
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* 딤 배경 */}
      <motion.div
        className="fixed inset-0 z-50 bg-black/40 touch-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      {/* 바텀 시트 */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[28px] px-5 pt-6 pb-10 safe-area-pb"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320, mass: 0.8 }}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-6" />
        <h2 className="text-[18px] font-bold text-ink text-center mb-1">팀 참여하기</h2>
        <p className="text-[13px] text-muted text-center mb-6">
          초대 코드를 입력해 팀에 참여하세요
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-primary tracking-wide">
              초대 코드
            </label>
            <input
              ref={inputRef}
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="초대 코드 8자리를 입력하세요"
              maxLength={8}
              className="w-full px-4 py-3.25 rounded-[14px] border-[1.5px] border-border bg-input-bg text-[14px] text-ink placeholder:text-muted placeholder:font-light outline-none transition-all duration-200 focus:border-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(91,79,207,0.10)]"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={isLoading || inviteCode.trim().length === 0}
            className="w-full py-4 mt-1 bg-primary text-white text-[15px] font-semibold rounded-[14px] shadow-[0_4px_18px_rgba(91,79,207,0.22)] transition-all duration-200 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '참여 중...' : '참여하기'}
          </button>
        </form>
        <button
          onClick={onClose}
          className="block w-full text-center mt-4 text-[14px] font-medium text-muted hover:text-ink transition-colors duration-200"
        >
          돌아가기
        </button>
      </motion.div>
    </>
  )
}

function TeamsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token } = useAuth()

  const [teams, setTeams] = useState<TeamListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showToast, setShowToast] = useState(() => searchParams.get('created') === '1')
  const [showJoinModal, setShowJoinModal] = useState(false)

  useEffect(() => {
    if (!showToast) return
    const t = setTimeout(() => setShowToast(false), 3000)
    return () => clearTimeout(t)
  }, [showToast])

  useEffect(() => {
    if (!token) return
    getTeams(token)
      .then((res) => setTeams(res.teams))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : '팀 목록을 불러오지 못했습니다.')
      })
      .finally(() => setIsLoading(false))
  }, [token])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col animate-fade-up">
      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto px-5 pt-5 flex flex-col">
        {error && (
          <p className="text-sm text-red-400 bg-red-50 rounded-[14px] px-4 py-3 mb-4">{error}</p>
        )}

        {teams.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mb-2">
              <svg
                className="w-7 h-7 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4a4 4 0 11-8 0 4 4 0 018 0zm6-4a2 2 0 11-4 0 2 2 0 014 0zM3 8a2 2 0 114 0 2 2 0 01-4 0z"
                />
              </svg>
            </div>
            <p className="text-[15px] font-semibold text-ink">아직 참여한 팀이 없어요</p>
            <p className="text-[13px] text-muted">팀을 만들거나 초대 코드로 참여해보세요</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5 pb-4">
            {teams.map((team) => (
              <li key={team.teamId}>
                <button
                  onClick={() => router.push(`/teams/${team.teamId}`)}
                  className="w-full flex items-center gap-4 bg-white rounded-[18px] border border-border px-4 py-3.5 text-left transition-all duration-200 hover:border-primary/50 hover:shadow-[0_4px_18px_rgba(91,79,207,0.10)] active:scale-[0.99]"
                >
                  <TeamAvatar imageUrl={team.teamImageUrl} name={team.teamName} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-ink truncate">{team.teamName}</p>
                    {(team.memberCount !== undefined || team.successCount !== undefined) && (
                      <p className="text-[12px] text-muted mt-0.5">
                        팀원 {team.memberCount ?? 0}명 · 성공 {team.successCount ?? 0}회
                      </p>
                    )}
                  </div>
                  <svg
                    className="w-4 h-4 text-muted shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 팀 액션 버튼 (in-flow) */}
      <div className="shrink-0 px-5 py-3 border-t border-border bg-white flex flex-col gap-2">
        <button
          onClick={() => router.push('/teams/new')}
          className="w-full py-3.5 bg-primary text-white text-[15px] font-semibold rounded-[14px] shadow-[0_4px_18px_rgba(91,79,207,0.22)] transition-all duration-200 hover:bg-primary-hover"
        >
          팀 생성하기
        </button>
        <button
          onClick={() => setShowJoinModal(true)}
          className="w-full py-3.5 bg-primary-light text-primary text-[15px] font-semibold rounded-[14px] transition-all duration-200 hover:bg-[#e0daf8]"
        >
          팀 참여하기
        </button>
      </div>

      {showToast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-sm bg-ink text-white text-[13px] font-medium text-center py-3.5 rounded-[14px] shadow-lg animate-fade-up z-50">
          팀이 생성되었습니다
        </div>
      )}

      <AnimatePresence>
        {showJoinModal && token && (
          <JoinModal
            token={token}
            onClose={() => setShowJoinModal(false)}
            onSuccess={(teamId) => router.push(`/teams/${teamId}`)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function TeamsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TeamsContent />
    </Suspense>
  )
}
