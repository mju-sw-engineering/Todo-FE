'use client'

import { useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { PlantIcon, getPlantStageLabel } from './PlantIcon'
import { PlantInfoPopover } from './PlantInfoPopover'

interface StreakCardProps {
  continuousTodoCount: number
}

export function StreakCard({ continuousTodoCount }: StreakCardProps) {
  const [plantInfoAnchor, setPlantInfoAnchor] = useState<DOMRect | null>(null)
  const infoButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <div className="bg-white rounded-[18px] border border-border mb-3 px-4 py-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-16 shrink-0 drop-shadow-sm">
          <PlantIcon count={continuousTodoCount} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-[11px] font-semibold text-muted tracking-wide uppercase">
              연속 성공 스트릭
            </p>
            <button
              ref={infoButtonRef}
              type="button"
              onClick={() =>
                setPlantInfoAnchor(
                  plantInfoAnchor ? null : (infoButtonRef.current?.getBoundingClientRect() ?? null)
                )
              }
              className="text-muted hover:text-gray-700 transition-colors duration-150 shrink-0"
              aria-label="성장 단계 안내"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
                <path
                  d="M7 6.5v3M7 4.5v.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[28px] font-bold text-ink leading-none">
              {continuousTodoCount}
            </span>
            <span className="text-[14px] font-semibold text-muted">일</span>
          </div>
          <span className="mt-1.5 inline-block text-[11px] font-semibold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full">
            {getPlantStageLabel(continuousTodoCount)}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <p className="text-[10px] text-muted">단계별 성장</p>
          <div className="flex gap-0.5 items-end">
            {[1, 4, 11, 21].map((threshold, i) => (
              <div
                key={threshold}
                className={`w-1.5 rounded-sm transition-all duration-300 ${
                  continuousTodoCount >= threshold ? 'bg-gray-900' : 'bg-border'
                }`}
                style={{ height: `${10 + i * 4}px` }}
              />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {plantInfoAnchor && (
          <PlantInfoPopover
            count={continuousTodoCount}
            anchor={plantInfoAnchor}
            onClose={() => setPlantInfoAnchor(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
