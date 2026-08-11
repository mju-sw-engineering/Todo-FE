'use client'

import { useRouter } from 'next/navigation'
import type { AvailabilityEventListItem } from '@/types/availability.types'

interface AvailabilityEventCardProps {
  teamId: number
  event: AvailabilityEventListItem
}

/**
 * 카드 전체가 버튼 — 미응답이면 응답 화면, 응답했거나 종료면 결과 화면으로 간다.
 * 상태 배지·"내 응답" 라벨 같은 중복 표기는 하단 힌트 한 줄로 대신한다.
 */
export function AvailabilityEventCard({ teamId, event }: AvailabilityEventCardProps) {
  const router = useRouter()
  const isClosed = event.status === 'CLOSED'
  const goResult = isClosed || event.myResponseSubmitted

  return (
    <button
      type="button"
      onClick={() =>
        router.push(
          goResult
            ? `/teams/${teamId}/availability/${event.eventId}/result`
            : `/teams/${teamId}/availability/${event.eventId}`
        )
      }
      className={`w-full text-left rounded-2xl border border-border px-4 py-3.5 transition-all duration-150 hover:border-gray-300 active:scale-[0.99] ${
        isClosed ? 'opacity-55' : ''
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[14px] font-bold text-ink truncate">{event.title}</p>
        {isClosed && <span className="text-[11px] font-semibold text-gray-400 shrink-0">종료</span>}
      </div>
      <p className="text-[11.5px] text-muted mt-1">
        {event.respondedCount}/{event.totalCount}명 응답 · {event.dateRangeLabel}
      </p>

      <p className="mt-2 text-[12px] font-bold">
        {isClosed ? (
          <span className="text-gray-500">결과 보기 →</span>
        ) : event.myResponseSubmitted ? (
          <span className="text-emerald-600">응답 완료 · 결과 보기 →</span>
        ) : (
          <span className="text-primary">응답하러 가기 →</span>
        )}
      </p>
    </button>
  )
}
