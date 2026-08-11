'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { useAuth } from '@/store/authStore'
import { getAvailabilitySummary, submitAvailabilityResponse } from '@/services/availabilityService'
import {
  AvailabilityGridShell,
  type AvailabilityDateOption,
} from '../components/AvailabilityGridShell'
import type { AvailabilitySummaryResponse } from '@/types/availability.types'
import { DAYS_KO } from '@/lib/dateUtils'

function slotKey(date: string, hour: number) {
  return `${date}|${hour}`
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

export default function AvailabilityMyResponsePage() {
  const router = useRouter()
  const params = useParams()
  const teamId = Number(params.teamId)
  const pollId = Number(params.eventId)
  const { token } = useAuth()

  const [summary, setSummary] = useState<AvailabilitySummaryResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const { isLoading: isSubmitting, error: submitError, run } = useAsyncTask()

  const dragModeRef = useRef<'select' | 'deselect' | null>(null)
  const isDraggingRef = useRef(false)

  useEffect(() => {
    if (!token || !pollId) return
    getAvailabilitySummary(pollId, token)
      .then((data) => {
        setSummary(data)
        setSelected(new Set(data.mySlots.map((slot) => slotKey(slot.date, slot.hour))))
      })
      .catch(() => setLoadError('투표 정보를 불러오지 못했습니다.'))
      .finally(() => setIsLoading(false))
  }, [token, pollId])

  function applySlot(key: string, shouldSelect: boolean) {
    setSelected((prev) => {
      if (prev.has(key) === shouldSelect) return prev
      const next = new Set(prev)
      if (shouldSelect) next.add(key)
      else next.delete(key)
      return next
    })
  }

  function handlePointerDown(date: string, hour: number, e: React.PointerEvent<HTMLButtonElement>) {
    const key = slotKey(date, hour)
    const shouldSelect = !selected.has(key)
    dragModeRef.current = shouldSelect ? 'select' : 'deselect'
    isDraggingRef.current = true
    applySlot(key, shouldSelect)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDraggingRef.current || dragModeRef.current === null) return
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
    const slotEl = el?.closest<HTMLElement>('[data-slot]')
    const key = slotEl?.dataset.slot
    if (!key) return
    applySlot(key, dragModeRef.current === 'select')
  }

  function endDrag() {
    isDraggingRef.current = false
    dragModeRef.current = null
  }

  async function handleSubmit() {
    if (!token || !summary) return

    const slots = [...selected].map((key) => {
      const [date, hourStr] = key.split('|')
      return { date, hour: Number(hourStr) }
    })

    try {
      await run(() => submitAvailabilityResponse(pollId, { slots }, token), {
        fallback: '응답 제출 중 오류가 발생했습니다.',
        rethrow: true,
      })
    } catch {
      return
    }

    router.push(`/teams/${teamId}/availability`)
  }

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

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-fade-up">
      <div className="px-5 pt-6 pb-3">
        <div className="flex items-center gap-2">
          <BackButton onClick={() => router.back()} />
          <h1 className="text-[18px] font-black text-ink leading-tight truncate">
            {summary.title}
          </h1>
        </div>
      </div>

      <p className="text-[11.5px] text-muted leading-relaxed px-5 pb-3">
        가능한 시간을 눌러서 선택하세요. 손가락으로 드래그하면 여러 칸을 한 번에 선택할 수 있어요.
      </p>

      <div
        className="flex-1 overflow-y-auto overflow-x-hidden"
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <AvailabilityGridShell
          dateOptions={dateOptions}
          timeSlots={hourSlots}
          renderCell={(date, time) => {
            const hour = Number(time)
            const key = slotKey(date, hour)
            const isSelected = selected.has(key)
            return (
              <button
                type="button"
                data-slot={key}
                onPointerDown={(e) => handlePointerDown(date, hour, e)}
                aria-pressed={isSelected}
                style={{ touchAction: 'none' }}
                className={`w-full h-full rounded-[4px] border transition-colors duration-100 ${
                  isSelected
                    ? 'bg-primary border-primary'
                    : 'bg-white border-border hover:border-gray-400'
                }`}
              />
            )
          }}
        />
      </div>

      {submitError && (
        <p className="mx-5 mb-2 text-[13px] text-status-red bg-status-red/10 rounded-xl px-4 py-2.5">
          {submitError}
        </p>
      )}

      <div className="px-5 py-4 border-t border-border">
        <Button size="lg" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? '제출 중...' : '완료'}
        </Button>
      </div>
    </div>
  )
}
