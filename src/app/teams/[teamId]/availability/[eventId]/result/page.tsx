'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BackButton } from '@/components/ui/BackButton'
import { BlobAvatar } from '@/components/ui/BlobAvatar'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { getAvailabilitySummary } from '@/services/availabilityService'
import { useAuth } from '@/store/authStore'
import { AvailabilityGridShell } from '../../components/AvailabilityGridShell'
import type { AvailabilitySummaryResponse, HeatmapSlot } from '@/types/availability.types'

const WEEKDAY_SHORT = ['일', '월', '화', '수', '목', '금', '토']

function fullDateLabel(date: string): string {
  const dow = new Date(`${date}T00:00:00`).getDay()
  const [, m, d] = date.split('-').map(Number)
  return `${m}월 ${d}일 (${WEEKDAY_SHORT[dow]})`
}

function slotStyle(count: number, isActive: boolean): React.CSSProperties {
  if (isActive)
    return { background: 'var(--color-primary)', borderColor: 'var(--color-primary-hover)' }
  if (count > 0)
    return { background: 'var(--color-primary-light)', borderColor: 'var(--color-primary-light)' }
  return { background: '#F8F9FB', borderColor: '#F8F9FB' }
}

function buildTimeSlots(startHour: number, endHour: number): string[] {
  return Array.from({ length: endHour - startHour }, (_, i) =>
    String(startHour + i).padStart(2, '0')
  )
}

export default function AvailabilityResultPage() {
  const router = useRouter()
  const params = useParams()
  const teamId = Number(params.teamId)
  const pollId = Number(params.eventId)
  const { token } = useAuth()

  const [poll, setPoll] = useState<AvailabilitySummaryResponse | null>(null)
  const { isLoading, error, run } = useAsyncTask(true)
  const [activeSlot, setActiveSlot] = useState<HeatmapSlot | null>(null)

  useEffect(() => {
    if (!token || Number.isNaN(pollId)) return
    run(() => getAvailabilitySummary(pollId, token), {
      fallback: '결과를 불러오지 못했습니다.',
    }).then((data) => {
      if (!data) return
      setPoll(data)
      setActiveSlot(data.bestSlot)
    })
  }, [token, pollId, run])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner variant="track" />
      </div>
    )
  }

  if (error || !poll) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-[14px] font-semibold text-gray-500">
          {error || '투표를 찾을 수 없습니다.'}
        </p>
      </div>
    )
  }

  const timeSlots = buildTimeSlots(poll.startHour, poll.endHour)

  function findSlot(date: string, hour: number): HeatmapSlot | null {
    return poll!.heatmap.find((s) => s.date === date && s.hour === hour) ?? null
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-fade-up">
      <div className="px-5 pt-6 pb-3">
        <div className="flex items-center gap-2">
          <BackButton onClick={() => router.back()} />
          <h1 className="text-[18px] font-black text-ink leading-tight truncate">
            {poll.title} · 결과
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4">
        <AvailabilityGridShell
          dateOptions={poll.dateOptions}
          timeSlots={timeSlots}
          renderCell={(date, time) => {
            const hour = Number(time)
            const slot = findSlot(date, hour)
            const isActive = activeSlot?.date === date && activeSlot?.hour === hour
            return (
              <button
                type="button"
                onClick={() => setActiveSlot(slot ?? { date, hour, count: 0, members: [] })}
                className="w-full h-full rounded-[4px] border-2 transition-all duration-100 relative"
                style={slotStyle(slot?.count ?? 0, isActive)}
              />
            )
          }}
        />

        <div className="flex items-center gap-3 flex-wrap px-5 py-3 text-[10px] font-semibold text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block bg-primary-light" />
            응답 적음
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block bg-primary" />
            전원 가능
          </span>
        </div>

        <div className="mx-5 px-3.5 py-3 rounded-2xl border border-border flex items-center gap-2.5">
          <div className="flex shrink-0">
            {(activeSlot?.members ?? []).map((name, i) => (
              <div key={name} className={i > 0 ? '-ml-2' : ''}>
                <div className="rounded-full ring-2 ring-white">
                  <BlobAvatar seed={name} size={26} />
                </div>
              </div>
            ))}
          </div>
          <div className="min-w-0">
            {activeSlot ? (
              <>
                <p className="text-[12.5px] font-bold text-ink">
                  {fullDateLabel(activeSlot.date)} {activeSlot.hour}:00 ·{' '}
                  <span
                    className="rounded px-1 py-0.5 -mx-1"
                    style={{ background: 'rgba(255,224,66,0.45)' }}
                  >
                    {activeSlot.count}/{poll.totalMemberCount}명 가능
                  </span>
                </p>
                <p className="text-[11px] text-muted mt-0.5 truncate">
                  {activeSlot.members.length > 0
                    ? activeSlot.members.join(', ')
                    : '아직 아무도 선택하지 않았어요'}
                </p>
              </>
            ) : (
              <p className="text-[12px] text-muted">그리드에서 시간을 선택해보세요</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-border">
        <Button variant="secondary" onClick={() => router.push(`/teams/${teamId}/availability`)}>
          목록으로
        </Button>
      </div>
    </div>
  )
}
