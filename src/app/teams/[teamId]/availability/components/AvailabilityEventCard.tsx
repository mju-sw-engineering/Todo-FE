'use client'

import { useRouter } from 'next/navigation'
import type { AvailabilityPollListItem } from '@/types/availability.types'

const WEEKDAY_SHORT = ['일', '월', '화', '수', '목', '금', '토']

function formatDateChip(date: string): string {
  const dow = new Date(`${date}T00:00:00`).getDay()
  const [, m, d] = date.split('-').map(Number)
  return `${WEEKDAY_SHORT[dow]} ${m}/${d}`
}

function formatDateRangeLabel(dateOptions: string[]): string {
  if (dateOptions.length === 0) return ''
  const sorted = [...dateOptions].sort()
  const first = formatDateChip(sorted[0])
  const last = formatDateChip(sorted[sorted.length - 1])
  return first === last ? first : `${first} ~ ${last}`
}

interface AvailabilityEventCardProps {
  teamId: number
  poll: AvailabilityPollListItem
}

/** 카드 전체가 버튼 — 아직 응답 안 했으면 응답 화면, 응답했으면 결과 화면으로 간다. */
export function AvailabilityEventCard({ teamId, poll }: AvailabilityEventCardProps) {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() =>
        router.push(
          poll.myResponded
            ? `/teams/${teamId}/availability/${poll.id}/result`
            : `/teams/${teamId}/availability/${poll.id}`
        )
      }
      className="w-full text-left rounded-2xl border border-border px-4 py-3.5 transition-all duration-150 hover:border-gray-300 active:scale-[0.99]"
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[14px] font-bold text-ink truncate">{poll.title}</p>
        {poll.allResponded && (
          <span className="text-[11px] font-semibold text-primary shrink-0">전원 응답</span>
        )}
      </div>
      <p className="text-[11.5px] text-muted mt-1">
        {poll.respondedCount}/{poll.totalMemberCount}명 응답 ·{' '}
        {formatDateRangeLabel(poll.dateOptions)}
      </p>

      <p className="mt-2 text-[12px] font-bold text-primary">
        {poll.myResponded ? '응답 완료 · 결과 보기 →' : '응답하러 가기 →'}
      </p>
    </button>
  )
}
