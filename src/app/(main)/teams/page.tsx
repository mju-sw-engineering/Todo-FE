'use client'

import { AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { FiMessageCircle } from 'react-icons/fi'
import { TeamAvatar } from '@/components/ui/TeamAvatar'
import { JoinModal } from './components/JoinModal'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { getTeams } from '@/services/teamService'
import { useAuth } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/PageLoader'
import type { TeamListItem } from '@/types/team.types'

function TeamsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token } = useAuth()

  const [teams, setTeams] = useState<TeamListItem[]>([])
  const { isLoading, error, run } = useAsyncTask(true)
  const [showToast, setShowToast] = useState(() => searchParams.get('created') === '1')
  // 가입 완료 화면의 "초대 코드로 참여" CTA가 ?join=1로 진입한다
  const [showJoinModal, setShowJoinModal] = useState(() => searchParams.get('join') === '1')

  useEffect(() => {
    if (!showToast) return
    const t = setTimeout(() => setShowToast(false), 3000)
    return () => clearTimeout(t)
  }, [showToast])

  useEffect(() => {
    if (!token) return
    run(
      async () => {
        const res = await getTeams(token)
        setTeams(res.teams)
      },
      { fallback: '팀 목록을 불러오지 못했습니다.' }
    )
  }, [token, run])

  if (isLoading) return <PageLoader />

  return (
    <div className="flex-1 flex flex-col animate-fade-up bg-white">
      <div className="flex-1 overflow-y-auto px-5 pt-6 flex flex-col">
        <div className="mb-2 pb-4">
          <h1 className="text-[20px] font-black text-ink leading-tight">팀</h1>
          <p className="text-[12px] text-muted mt-0.5">참여 중인 팀을 확인하고 관리하세요</p>
        </div>

        {error && (
          <p className="text-sm text-status-red bg-status-red/10 rounded-[14px] px-4 py-3 mb-4">
            {error}
          </p>
        )}

        {teams.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <svg
                className="w-7 h-7 text-gray-300"
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
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/teams/${team.teamId}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') router.push(`/teams/${team.teamId}`)
                  }}
                  className="w-full flex items-center gap-3 bg-white rounded-[18px] border border-border pl-4 pr-2 py-2.5 text-left transition-all duration-200 hover:border-gray-300 hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] active:scale-[0.99] cursor-pointer"
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
                  <div className="w-px h-8 bg-border shrink-0" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(
                        `/teams/${team.teamId}/chat?title=${encodeURIComponent(team.teamName)}`
                      )
                    }}
                    className="shrink-0 w-11 h-11 flex items-center justify-center rounded-full text-primary hover:bg-primary/10 active:bg-primary/15 active:scale-95 transition-all duration-150"
                    aria-label={`${team.teamName} 채팅`}
                  >
                    <FiMessageCircle size={19} strokeWidth={2} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="shrink-0 px-5 py-3 border-t border-border bg-white flex flex-col gap-2">
        <Button onClick={() => router.push('/teams/new')}>팀 생성하기</Button>
        <Button variant="secondary" onClick={() => setShowJoinModal(true)}>
          팀 참여하기
        </Button>
      </div>

      {showToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-sm bg-ink text-white text-[13px] font-medium text-center py-3.5 rounded-[14px] shadow-lg animate-fade-up z-50">
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
    <Suspense fallback={<PageLoader />}>
      <TeamsContent />
    </Suspense>
  )
}
