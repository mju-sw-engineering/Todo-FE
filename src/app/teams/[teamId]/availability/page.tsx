'use client'

import { useParams, useRouter } from 'next/navigation'
import { BackButton } from '@/components/ui/BackButton'
import { AvailabilityEventCard } from './components/AvailabilityEventCard'
import { MOCK_EVENTS } from './components/mockAvailabilityData'

export default function AvailabilityEventListPage() {
  const router = useRouter()
  const params = useParams()
  const teamId = Number(params.teamId)

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
            aria-label="이벤트 만들기"
            className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center shrink-0 hover:opacity-85 transition-opacity active:scale-95"
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
        {MOCK_EVENTS.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <p className="text-[15px] font-bold text-gray-900">아직 만들어진 투표가 없어요</p>
            <p className="text-[13px] text-gray-400 mt-1">
              오른쪽 위 + 버튼으로 새 투표를 만들어보세요
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {MOCK_EVENTS.map((event) => (
              <AvailabilityEventCard key={event.eventId} teamId={teamId} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
