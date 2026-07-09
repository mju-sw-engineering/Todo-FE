'use client'

import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { PlantIcon } from './PlantIcon'

const POPOVER_WIDTH = 252

const PLANT_STAGES = [
  { count: 0, label: '씨앗', range: '0일', desc: '아직 시작 전이에요' },
  { count: 1, label: '새싹', range: '1~3일', desc: '이제 막 시작했어요' },
  { count: 4, label: '식물', range: '4~10일', desc: '잘 자라고 있어요' },
  { count: 11, label: '나무', range: '11~20일', desc: '많이 성장했어요' },
  { count: 21, label: '꽃', range: '21일 이상', desc: '최고 단계예요!' },
]

function getStageIndex(count: number): number {
  if (count >= 21) return 4
  if (count >= 11) return 3
  if (count >= 4) return 2
  if (count >= 1) return 1
  return 0
}

interface PlantInfoPopoverProps {
  count: number
  anchor: DOMRect
  onClose: () => void
}

export function PlantInfoPopover({ count, anchor, onClose }: PlantInfoPopoverProps) {
  const gap = 10
  const arrowSize = 6

  let left = anchor.left + anchor.width / 2 - POPOVER_WIDTH / 2
  left = Math.max(12, Math.min(left, window.innerWidth - POPOVER_WIDTH - 12))
  const arrowLeft = anchor.left + anchor.width / 2 - left - arrowSize

  const spaceBelow = window.innerHeight - anchor.bottom
  const opensDown = spaceBelow > 280
  const top = opensDown ? anchor.bottom + gap : undefined
  const bottom = opensDown ? undefined : window.innerHeight - anchor.top + gap

  return createPortal(
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: opensDown ? -6 : 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: opensDown ? -6 : 6 }}
        transition={{ type: 'spring', damping: 22, stiffness: 420, mass: 0.5 }}
        style={{ top, bottom, left, width: POPOVER_WIDTH }}
        className="fixed z-50 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.13)] border border-border p-3.5"
      >
        {opensDown && (
          <div
            className="absolute -top-1.5 w-3 h-3 bg-white border-l border-t border-border rotate-45 rounded-tl-sm"
            style={{ left: arrowLeft }}
          />
        )}

        <p className="text-[12px] font-bold text-ink mb-2.5 px-0.5">성장 단계</p>
        <div className="flex flex-col gap-1">
          {PLANT_STAGES.map((stage, i) => {
            const isCurrent = getStageIndex(count) === i
            return (
              <div
                key={stage.label}
                className={`flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 ${isCurrent ? 'bg-gray-100' : ''}`}
              >
                <div className="w-6 h-8 shrink-0">
                  <PlantIcon count={stage.count} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[12px] font-semibold leading-tight ${isCurrent ? 'text-gray-900' : 'text-ink'}`}
                  >
                    {stage.label}
                  </p>
                  <p className="text-[10px] text-muted mt-0.5">{stage.range}</p>
                </div>
                {isCurrent ? (
                  <span className="text-[10px] font-semibold text-gray-900 bg-white px-2 py-0.5 rounded-full border border-gray-200 shrink-0">
                    현재
                  </span>
                ) : (
                  <p className="text-[10px] text-muted shrink-0">{stage.desc}</p>
                )}
              </div>
            )
          })}
        </div>

        {!opensDown && (
          <div
            className="absolute -bottom-1.5 w-3 h-3 bg-white border-r border-b border-border rotate-45 rounded-br-sm"
            style={{ left: arrowLeft }}
          />
        )}
      </motion.div>
    </>,
    document.body
  )
}
