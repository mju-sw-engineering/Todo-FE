'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
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

  function toggleSlot(date: string, time: string) {
    const key = slotKey(date, time)
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
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
        가능한 시간을 눌러서 선택하세요. 여러 칸을 눌러 한 번에 여러 시간을 선택할 수 있어요.
      </p>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <AvailabilityGridShell
          dateOptions={event.dateOptions}
          timeSlots={event.timeSlots}
          renderCell={(date, time) => {
            const isSelected = selected.has(slotKey(date, time))
            return (
              <button
                type="button"
                onClick={() => toggleSlot(date, time)}
                aria-pressed={isSelected}
                className={`w-full h-full rounded-[4px] border transition-colors duration-100 ${
                  isSelected
                    ? 'bg-gray-900 border-gray-900'
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
