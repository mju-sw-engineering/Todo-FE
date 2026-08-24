'use client'

import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { TeamHiveIcon } from './TeamHiveIcon'

const POPOVER_WIDTH = 272

/**
 * BE의 TeamHiveService.LEVEL_THRESHOLDS와 같은 값이다.
 * 응답은 현재/다음 문턱값만 주기 때문에 전체 단계를 보여주려면 여기 둘 수밖에 없다.
 * BE에서 문턱값을 바꾸면 이 배열도 같이 고쳐야 한다.
 */
const LEVEL_THRESHOLDS = [0, 30, 100, 300]
const LEVEL_NAMES = ['새 벌집', '자라는 벌집', '튼튼한 벌집', '꿀샘 벌집']

function rangeLabel(index: number): string {
  const from = LEVEL_THRESHOLDS[index]
  const next = LEVEL_THRESHOLDS[index + 1]
  return next === undefined ? `${from}개~` : `${from}~${next - 1}개`
}

interface HiveInfoPopoverProps {
  level: number
  totalRecords: number
  nextThreshold: number | null
  anchor: DOMRect
  onClose: () => void
}

export function HiveInfoPopover({
  level,
  totalRecords,
  nextThreshold,
  anchor,
  onClose,
}: HiveInfoPopoverProps) {
  const gap = 10
  const arrowSize = 6

  let left = anchor.left + anchor.width / 2 - POPOVER_WIDTH / 2
  left = Math.max(12, Math.min(left, window.innerWidth - POPOVER_WIDTH - 12))
  const arrowLeft = anchor.left + anchor.width / 2 - left - arrowSize

  const spaceBelow = window.innerHeight - anchor.bottom
  const opensDown = spaceBelow > 320
  const top = opensDown ? anchor.bottom + gap : undefined
  const bottom = opensDown ? undefined : window.innerHeight - anchor.top + gap

  const remaining = nextThreshold === null ? null : nextThreshold - totalRecords

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

        <p className="text-[12px] font-bold text-ink px-0.5">벌집 성장 단계</p>
        <p className="text-[10.5px] text-muted mt-1 mb-2.5 px-0.5 leading-relaxed">
          팀원이 할 일을 인증할 때마다 기록이 1개씩 쌓이고, 모일수록 벌집이 자라요.
        </p>

        <div className="flex flex-col gap-1">
          {LEVEL_NAMES.map((name, i) => {
            const isCurrent = level === i + 1
            return (
              <div
                key={name}
                className={`flex items-center gap-2.5 rounded-xl px-2 py-1.5 ${
                  isCurrent ? 'bg-neutral-30' : ''
                }`}
              >
                <span className="shrink-0">
                  <TeamHiveIcon level={i + 1} size={26} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[12px] font-semibold leading-tight text-ink">
                    Lv.{i + 1} {name}
                  </span>
                  <span className="block text-[10px] text-muted mt-0.5">{rangeLabel(i)}</span>
                </span>
                {isCurrent && (
                  <span className="shrink-0 text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full">
                    현재
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <p className="mt-2.5 pt-2.5 border-t border-border text-[11px] font-semibold text-muted px-0.5">
          함께 모은 기록 <b className="font-black text-ink">{totalRecords}개</b>
          {remaining !== null && (
            <>
              {' · '}다음 단계까지 <b className="font-black text-ink">{remaining}개</b>
            </>
          )}
        </p>

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
