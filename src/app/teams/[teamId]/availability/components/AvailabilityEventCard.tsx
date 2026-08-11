'use client'

import { useRouter } from 'next/navigation'
import type { AvailabilityPollListItem } from '@/types/availability.types'
import { DAYS_KO } from '@/lib/dateUtils'

interface AvailabilityEventCardProps {
  teamId: number
  poll: AvailabilityPollListItem
}

function formatDateRangeLabel(dateOptions: string[]): string {
  if (dateOptions.length === 0) return ''
  const sorted = [...dateOptions].sort()
  const first = sorted[0]
  const last = sorted[sorted.length - 1]

  function shortLabel(dateStr: string): string {
    const date = new Date(`${dateStr}T00:00:00`)
    const dow = DAYS_KO[date.getDay()].charAt(0)
    const [, m, d] = dateStr.split('-').map(Number)
    return `${dow} ${m}/${d}`
  }

  if (first === last) return shortLabel(first)
  return `${shortLabel(first)} ~ ${shortLabel(last)}`
}

export function AvailabilityEventCard({ teamId, poll }: AvailabilityEventCardProps) {
  const router = useRouter()

  return (
    <div className="rounded-2xl border border-border px-4 py-3.5">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-[13.5px] font-bold text-ink">{poll.title}</p>
        {poll.allResponded && (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap bg-emerald-50 text-emerald-600">
            전원 응답
          </span>
        )}
      </div>
      <p className="text-[11.5px] text-muted">
        {poll.respondedCount}/{poll.totalMemberCount}명 응답 ·{' '}
        {formatDateRangeLabel(poll.dateOptions)}
      </p>

      <div className="flex items-center justify-between mt-2.5">
        {poll.myResponded ? (
          <span className="text-[11.5px] font-semibold text-emerald-600">✓ 응답완료</span>
        ) : (
          <span className="text-[11.5px] text-muted">내 응답: 미완료</span>
        )}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => router.push(`/teams/${teamId}/availability/${poll.id}/result`)}
            className="text-[11px] font-bold px-3.5 py-1.5 rounded-full border border-border text-ink hover:border-primary transition-colors"
          >
            결과보기
          </button>
          <button
            onClick={() => router.push(`/teams/${teamId}/availability/${poll.id}`)}
            className="text-[11px] font-bold px-3.5 py-1.5 rounded-full bg-primary text-white hover:opacity-85 transition-opacity"
          >
            {poll.myResponded ? '응답 수정' : '응답하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
