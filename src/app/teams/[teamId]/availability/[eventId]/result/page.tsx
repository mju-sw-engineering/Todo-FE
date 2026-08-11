'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { BackButton } from '@/components/ui/BackButton'
import { BlobAvatar } from '@/components/ui/BlobAvatar'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/store/authStore'
import { getAvailabilitySummary } from '@/services/availabilityService'
import {
  AvailabilityGridShell,
  type AvailabilityDateOption,
} from '../../components/AvailabilityGridShell'
import type { AvailabilitySummaryResponse, HeatmapSlot } from '@/types/availability.types'
import { DAYS_KO } from '@/lib/dateUtils'

const HEAT_LEVELS = [
  { label: '일부 가능', className: 'bg-primary/15' },
  { label: '과반 가능', className: 'bg-primary/40' },
  { label: '대부분 가능', className: 'bg-primary/70' },
  { label: '전원 가능', className: 'bg-primary' },
]

function heatClassName(count: number, total: number): string {
  if (count <= 0 || total <= 0) return 'bg-gray-50 border-border'
  const ratio = count / total
  if (ratio >= 1) return 'bg-primary border-primary'
  if (ratio >= 0.75) return 'bg-primary/70 border-primary/70'
  if (ratio >= 0.5) return 'bg-primary/40 border-primary/40'
  return 'bg-primary/15 border-primary/15'
}

function buildDateOptions(dateOptions: string[]): AvailabilityDateOption[] {
  return dateOptions.map((date) => ({
    date,
    label: DAYS_KO[new Date(`${date}T00:00:00`).getDay()].charAt(0),
  }))
}

function buildHourSlots(startHour: number, endHour: number): string[] {
  return Array.from({ length: endHour - startHour }, (_, i) =>
    (startHour + i).toString().padStart(2, '0')
  )
}

function dateShortLabel(date: string): string {
  const d = new Date(`${date}T00:00:00`)
  const [, m, day] = date.split('-').map(Number)
  return `${DAYS_KO[d.getDay()].charAt(0)} ${m}/${day}`
}

export default function AvailabilityResultPage() {
  const router = useRouter()
  const params = useParams()
  const teamId = Number(params.teamId)
  const pollId = Number(params.eventId)
  const { token } = useAuth()

  const [summary, setSummary] = useState<AvailabilitySummaryResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [activeSlot, setActiveSlot] = useState<HeatmapSlot | null>(null)

  useEffect(() => {
    if (!token || !pollId) return
    getAvailabilitySummary(pollId, token)
      .then((data) => {
        setSummary(data)
        setActiveSlot(data.bestSlot)
      })
      .catch(() => setLoadError('결과를 불러오지 못했습니다.'))
      .finally(() => setIsLoading(false))
  }, [token, pollId])

  const heatmapByKey = useMemo(() => {
    const map = new Map<string, HeatmapSlot>()
    summary?.heatmap.forEach((slot) => map.set(`${slot.date}|${slot.hour}`, slot))
    return map
  }, [summary])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (loadError || !summary) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 px-5 text-center">
        <p className="text-[14px] font-semibold text-gray-500">
          {loadError || '투표 정보를 찾을 수 없습니다.'}
        </p>
        <button
          onClick={() => router.push(`/teams/${teamId}/availability`)}
          className="mt-2 px-5 py-2 bg-gray-100 text-gray-700 text-[13px] font-semibold rounded-xl hover:bg-gray-200 transition-colors"
        >
          목록으로
        </button>
      </div>
    )
  }

  const dateOptions = buildDateOptions(summary.dateOptions)
  const hourSlots = buildHourSlots(summary.startHour, summary.endHour)
  const bestSlot = summary.bestSlot

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-fade-up">
      <div className="px-5 pt-6 pb-3">
        <div className="flex items-center gap-2">
          <BackButton onClick={() => router.back()} />
          <h1 className="text-[18px] font-black text-ink leading-tight truncate">
            {summary.title} · 결과
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4">
        {summary.allResponded && bestSlot && (
          <div className="mx-5 mb-3 px-4 py-3 rounded-2xl bg-primary/10 text-primary text-[12.5px] font-bold leading-relaxed">
            전원({summary.totalMemberCount}/{summary.totalMemberCount}명) 가능한 시간:{' '}
            {dateShortLabel(bestSlot.date)} {bestSlot.hour}:00
          </div>
        )}

        <AvailabilityGridShell
          dateOptions={dateOptions}
          timeSlots={hourSlots}
          renderCell={(date, time) => {
            const hour = Number(time)
            const slot = heatmapByKey.get(`${date}|${hour}`) ?? null
            const isActive = activeSlot?.date === date && activeSlot?.hour === hour
            return (
              <button
                type="button"
                onClick={() => setActiveSlot(slot ?? { date, hour, count: 0, members: [] })}
                className={`w-full h-full rounded-[4px] border transition-all duration-100 relative ${heatClassName(
                  slot?.count ?? 0,
                  summary.totalMemberCount
                )} ${isActive ? 'ring-2 ring-primary ring-offset-1' : ''}`}
              />
            )
          }}
        />

        <div className="flex items-center gap-3 flex-wrap px-5 py-3 text-[10px] font-semibold text-muted">
          {HEAT_LEVELS.map((level) => (
            <span key={level.label} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-sm inline-block ${level.className}`} />
              {level.label}
            </span>
          ))}
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
                  {dateShortLabel(activeSlot.date)} {activeSlot.hour}:00 · {activeSlot.count}/
                  {summary.totalMemberCount}명 가능
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
