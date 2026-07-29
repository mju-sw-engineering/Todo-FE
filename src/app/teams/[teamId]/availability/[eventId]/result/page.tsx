'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { BackButton } from '@/components/ui/BackButton'
import { BlobAvatar } from '@/components/ui/BlobAvatar'
import { AvailabilityGridShell } from '../../components/AvailabilityGridShell'
import { MOCK_EVENT_SUMMARY } from '../../components/mockAvailabilityData'
import type { AvailabilitySlotSummary } from '@/types/availability.types'

const HEAT_LEVELS = [
  { label: '1명', className: 'bg-emerald-100' },
  { label: '2명', className: 'bg-emerald-200' },
  { label: '3명', className: 'bg-emerald-400' },
  { label: '4명(전원)', className: 'bg-emerald-500' },
]

function heatClassName(count: number, total: number) {
  if (count <= 0) return 'bg-gray-50 border-border'
  if (count === total) return 'bg-emerald-500 border-emerald-500'
  if (count >= 3) return 'bg-emerald-400 border-emerald-400'
  if (count === 2) return 'bg-emerald-200 border-emerald-200'
  return 'bg-emerald-100 border-emerald-100'
}

export default function AvailabilityResultPage() {
  const router = useRouter()
  const params = useParams()
  const teamId = Number(params.teamId)

  const summary = MOCK_EVENT_SUMMARY
  const bestSlot =
    summary.slots.find((s) => s.count === s.total && s.total > 0) ??
    summary.slots.reduce<AvailabilitySlotSummary | null>(
      (best, s) => (best === null || s.count > best.count ? s : best),
      null
    )

  const [activeSlot, setActiveSlot] = useState<AvailabilitySlotSummary | null>(bestSlot)

  function findSlot(date: string, time: string) {
    return summary.slots.find((s) => s.date === date && s.time === time) ?? null
  }

  function dateLabel(date: string) {
    return summary.dateOptions.find((d) => d.date === date)?.label ?? ''
  }

  const allMatchSlot = summary.slots.find((s) => s.count === s.total && s.total > 0)

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
        {allMatchSlot && (
          <div className="mx-5 mb-3 px-4 py-3 rounded-2xl bg-emerald-50 text-emerald-700 text-[12.5px] font-bold leading-relaxed">
            🎉 전원({allMatchSlot.total}/{allMatchSlot.total}명) 가능한 시간:{' '}
            {dateLabel(allMatchSlot.date)} {allMatchSlot.date} · {allMatchSlot.time}:00
          </div>
        )}

        <AvailabilityGridShell
          dateOptions={summary.dateOptions}
          timeSlots={summary.timeSlots}
          renderCell={(date, time) => {
            const slot = findSlot(date, time)
            const isActive = activeSlot?.date === date && activeSlot?.time === time
            return (
              <button
                type="button"
                onClick={() => setActiveSlot(slot)}
                className={`w-full h-full rounded-[4px] border transition-all duration-100 relative ${heatClassName(
                  slot?.count ?? 0,
                  slot?.total ?? 4
                )} ${isActive ? 'ring-2 ring-gray-900 ring-offset-1' : ''}`}
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
            {(activeSlot?.memberNames ?? []).map((name, i) => (
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
                  {dateLabel(activeSlot.date)} {activeSlot.date} {activeSlot.time}:00 ·{' '}
                  {activeSlot.count}/{activeSlot.total}명 가능
                </p>
                <p className="text-[11px] text-muted mt-0.5 truncate">
                  {activeSlot.memberNames.length > 0
                    ? activeSlot.memberNames.join(', ')
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
        <button
          onClick={() => router.push(`/teams/${teamId}/availability`)}
          className="w-full py-3.75 text-center text-[15px] font-semibold text-ink bg-gray-100 rounded-[14px] hover:bg-gray-200 transition-colors"
        >
          목록으로
        </button>
      </div>
    </div>
  )
}
