'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { BackButton } from '@/components/ui/BackButton'
import { Spinner } from '@/components/ui/Spinner'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { getAvailabilityPolls } from '@/services/availabilityService'
import { useAuth } from '@/store/authStore'
import { AvailabilityEventCard } from './components/AvailabilityEventCard'
import type { AvailabilityPollListItem } from '@/types/availability.types'

function AvailabilityListContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const teamId = Number(params.teamId)
  const { token } = useAuth()

  const [polls, setPolls] = useState<AvailabilityPollListItem[]>([])
  const [showToast, setShowToast] = useState(searchParams.get('created') === '1')
  const { isLoading, error, run } = useAsyncTask(true)

  useEffect(() => {
    if (!token || Number.isNaN(teamId)) return
    run(() => getAvailabilityPolls(teamId, token), {
      fallback: '투표 목록을 불러오지 못했습니다.',
    }).then((data) => {
      if (data) setPolls(data)
    })
  }, [token, teamId, run])

  useEffect(() => {
    if (!showToast) return
    const timer = setTimeout(() => setShowToast(false), 2400)
    return () => clearTimeout(timer)
  }, [showToast])

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-fade-up">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <BackButton onClick={() => router.back()} />
          <div className="flex-1 min-w-0">
            <h1 className="text-[20px] font-black text-ink leading-tight">가능한 시간 투표</h1>
            <p className="text-[12px] text-muted mt-0.5">팀원들과 가능한 시간을 맞춰보세요</p>
          </div>
          <button
            onClick={() => router.push(`/teams/${teamId}/availability/new`)}
            aria-label="투표 만들기"
            className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shrink-0 hover:opacity-85 transition-opacity active:scale-95"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 pb-6">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Spinner variant="track" />
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-20 text-center">
            <p className="text-[14px] font-semibold text-gray-500">{error}</p>
          </div>
        ) : polls.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <p className="text-[15px] font-bold text-gray-900">아직 만들어진 투표가 없어요</p>
            <p className="text-[13px] text-gray-400 mt-1">
              오른쪽 위 + 버튼으로 새 투표를 만들어보세요
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {polls.map((poll) => (
              <AvailabilityEventCard key={poll.id} teamId={teamId} poll={poll} />
            ))}
          </div>
        )}
      </div>

      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-sm bg-ink text-white text-[13px] font-bold text-center py-3.5 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.2)] animate-fade-up z-50">
          투표가 생성되었습니다
        </div>
      )}
    </div>
  )
}

export default function AvailabilityEventListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <Spinner variant="track" />
        </div>
      }
    >
      <AvailabilityListContent />
    </Suspense>
  )
}
