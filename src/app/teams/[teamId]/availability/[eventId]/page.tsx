'use client'

import { useParams, useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { AvailabilityGridShell } from '../components/AvailabilityGridShell'
import { MOCK_EVENT_DETAIL } from '../components/mockAvailabilityData'

function slotKey(date: string, time: string) {
  return `${date}|${time}`
}

export default function AvailabilityMyResponsePage() {
  const router = useRouter()
  const params = useParams()
  const teamId = Number(params.teamId)

  const event = MOCK_EVENT_DETAIL
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const dragModeRef = useRef<'select' | 'deselect' | null>(null)
  const isDraggingRef = useRef(false)

  function applySlot(key: string, shouldSelect: boolean) {
    setSelected((prev) => {
      if (prev.has(key) === shouldSelect) return prev
      const next = new Set(prev)
      if (shouldSelect) next.add(key)
      else next.delete(key)
      return next
    })
  }

  function handlePointerDown(date: string, time: string, e: React.PointerEvent<HTMLButtonElement>) {
    const key = slotKey(date, time)
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

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-fade-up">
      <div className="px-5 pt-6 pb-3">
        <div className="flex items-center gap-2">
          <BackButton onClick={() => router.back()} />
          <h1 className="text-[18px] font-black text-ink leading-tight truncate">{event.title}</h1>
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
          dateOptions={event.dateOptions}
          timeSlots={event.timeSlots}
          renderCell={(date, time) => {
            const key = slotKey(date, time)
            const isSelected = selected.has(key)
            return (
              <button
                type="button"
                data-slot={key}
                onPointerDown={(e) => handlePointerDown(date, time, e)}
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
        <Button size="lg" onClick={() => router.push(`/teams/${teamId}/availability`)}>
          완료
        </Button>
      </div>
    </div>
  )
}
