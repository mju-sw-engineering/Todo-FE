'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { getAvailabilitySummary, submitAvailabilityResponse } from '@/services/availabilityService'
import { useAuth } from '@/store/authStore'
import { AvailabilityGridShell } from '../components/AvailabilityGridShell'
import type { AvailabilitySummaryResponse } from '@/types/availability.types'

function slotKey(date: string, hour: number) {
  return `${date}|${hour}`
}

function buildTimeSlots(startHour: number, endHour: number): string[] {
  return Array.from({ length: endHour - startHour }, (_, i) =>
    String(startHour + i).padStart(2, '0')
  )
}

export default function AvailabilityMyResponsePage() {
  const router = useRouter()
  const params = useParams()
  const teamId = Number(params.teamId)
  const pollId = Number(params.eventId)
  const { token } = useAuth()

  const [poll, setPoll] = useState<AvailabilitySummaryResponse | null>(null)
  const { isLoading, error, run } = useAsyncTask(true)
  const submitTask = useAsyncTask()

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const dragModeRef = useRef<'select' | 'deselect' | null>(null)
  const isDraggingRef = useRef(false)

  useEffect(() => {
    if (!token || Number.isNaN(pollId)) return
    run(() => getAvailabilitySummary(pollId, token), {
      fallback: '투표 정보를 불러오지 못했습니다.',
    }).then((data) => {
      if (!data) return
      setPoll(data)
      setSelected(new Set(data.mySlots.map((s) => slotKey(s.date, s.hour))))
    })
  }, [token, pollId, run])

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
    if (!token || !poll) return
    const slots = Array.from(selected).map((key) => {
      const [date, hour] = key.split('|')
      return { date, hour: Number(hour) }
    })
    try {
      await submitTask.run(() => submitAvailabilityResponse(pollId, { slots }, token), {
        fallback: '제출에 실패했습니다.',
        rethrow: true,
      })
    } catch {
      return
    }
    router.push(`/teams/${teamId}/availability/${pollId}/result`)
  }

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

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-fade-up">
      <div className="px-5 pt-6 pb-3">
        <div className="flex items-center gap-2">
          <BackButton onClick={() => router.back()} />
          <h1 className="text-[18px] font-black text-ink leading-tight truncate">{poll.title}</h1>
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
          dateOptions={poll.dateOptions}
          timeSlots={timeSlots}
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

      <div className="px-5 py-4 border-t border-border">
        <Button size="lg" onClick={handleSubmit} disabled={submitTask.isLoading}>
          {submitTask.isLoading ? '제출 중...' : '완료'}
        </Button>
      </div>
    </div>
  )
}
