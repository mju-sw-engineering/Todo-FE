'use client'

import { useRouter } from 'next/navigation'
import type { AvailabilityEventListItem } from '@/types/availability.types'

interface AvailabilityEventCardProps {
  teamId: number
  event: AvailabilityEventListItem
}

export function AvailabilityEventCard({ teamId, event }: AvailabilityEventCardProps) {
  const router = useRouter()
  const isClosed = event.status === 'CLOSED'

  return (
    <div className={`rounded-2xl border border-border px-4 py-3.5 ${isClosed ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-[13.5px] font-bold text-ink">{event.title}</p>
        <span
          className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap ${
            isClosed ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600'
          }`}
        >
          {isClosed ? '종료' : '진행중'}
        </span>
      </div>
      <p className="text-[11.5px] text-muted">
        {event.respondedCount}/{event.totalCount}명 응답 · {event.dateRangeLabel}
      </p>

      {!isClosed && (
        <div className="flex items-center justify-between mt-2.5">
          {event.myResponseSubmitted ? (
            <span className="text-[11.5px] font-semibold text-emerald-600">✓ 응답완료</span>
          ) : (
            <span className="text-[11.5px] text-muted">내 응답: 미완료</span>
          )}
          {event.myResponseSubmitted ? (
            <button
              onClick={() => router.push(`/teams/${teamId}/availability/${event.eventId}/result`)}
              className="text-[11px] font-bold px-3.5 py-1.5 rounded-full border border-border text-ink hover:border-primary transition-colors"
            >
              결과보기
            </button>
          ) : (
            <button
              onClick={() => router.push(`/teams/${teamId}/availability/${event.eventId}`)}
              className="text-[11px] font-bold px-3.5 py-1.5 rounded-full bg-primary text-white hover:opacity-85 transition-opacity"
            >
              응답하기
            </button>
          )}
        </div>
      )}
    </div>
  )
}
