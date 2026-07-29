'use client'

import { useRouter } from 'next/navigation'

interface AvailabilityEntryCardProps {
  teamId: number
}

export function AvailabilityEntryCard({ teamId }: AvailabilityEntryCardProps) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push(`/teams/${teamId}/availability`)}
      className="w-full flex items-center gap-3 bg-white rounded-[18px] border border-border mb-3 px-4 py-4 text-left transition-all duration-200 hover:border-gray-300 hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] active:scale-[0.99]"
    >
      <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-[16px]">
        🗓️
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[14px] font-semibold text-ink">가능한 시간 투표</p>
          <span className="text-[9px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-full leading-none shrink-0">
            NEW
          </span>
        </div>
        <p className="text-[11.5px] text-muted mt-0.5">팀원들과 가능한 시간을 맞춰보세요</p>
      </div>
      <svg
        className="w-4 h-4 text-gray-400 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}
