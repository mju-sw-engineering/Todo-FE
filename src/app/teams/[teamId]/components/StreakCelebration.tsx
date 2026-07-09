'use client'

import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { PlantIcon } from '@/components/ui/PlantIcon'

const TOTAL = 30
const DISMISS_MS = 9000

function skipKey(teamId: number): string {
  const today = new Date().toISOString().slice(0, 10)
  return `streak_skip_${teamId}_${today}`
}

export function isStreakSkippedToday(teamId: number): boolean {
  try {
    return localStorage.getItem(skipKey(teamId)) === '1'
  } catch {
    return false
  }
}

function getMotivation(count: number): string {
  if (count >= 30) return '한 달 연속! 신화가 됐어요'
  if (count >= 21) return '21일 달성! 전설이에요'
  if (count >= 14) return '2주 연속! 믿을 수 없어요'
  if (count >= 7) return '일주일 연속! 최고예요'
  if (count >= 3) return '3일 연속! 훌륭해요'
  if (count >= 1) return '첫 스트릭 달성! 시작이 반이에요'
  return '계속 도전하세요'
}

function getCharacterCount(day: number): number {
  if (day >= 21) return 21
  if (day >= 11) return 11
  if (day >= 4) return 4
  return 1
}

interface StampCellProps {
  day: number
  count: number
}

function StampCell({ day, count }: StampCellProps) {
  const isFilled = day < count
  const isNew = day === count
  const charCount = getCharacterCount(day)

  const goldStyle = {
    background: 'linear-gradient(160deg, #FEFCE8 0%, #FEF3C7 100%)',
    boxShadow: '0 0 0 2px #F5CC5A',
  }

  if (isNew) {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <div style={{ perspective: '320px' }} className="w-full">
          <motion.div
            initial={{ y: -48, rotateX: 65, scale: 1.5, opacity: 0 }}
            animate={{ y: 0, rotateX: 0, scale: [1.5, 0.82, 1.1, 1], opacity: 1 }}
            transition={{
              delay: 0.45,
              y: { type: 'spring', damping: 9, stiffness: 240, mass: 0.6 },
              rotateX: { duration: 0.28, delay: 0.45, ease: 'easeOut' },
              scale: { duration: 0.52, delay: 0.45, times: [0, 0.45, 0.75, 1], ease: 'easeOut' },
              opacity: { duration: 0.14, delay: 0.45 },
            }}
            className="relative w-full h-15 rounded-xl flex items-center justify-center overflow-visible"
            style={{
              background: 'linear-gradient(160deg, #FEFCE8 0%, #FEF3C7 100%)',
              boxShadow: '0 0 0 2.5px #F5CC5A, 0 4px 18px rgba(245,204,90,0.5)',
            }}
          >
            {/* Ripple 1 */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0.65 }}
              animate={{ scale: 2.8, opacity: 0 }}
              transition={{ delay: 0.7, duration: 0.5, ease: 'easeOut' }}
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{ background: 'rgba(245,204,90,0.22)' }}
            />
            {/* Ripple 2 */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0.4 }}
              animate={{ scale: 3.4, opacity: 0 }}
              transition={{ delay: 0.76, duration: 0.65, ease: 'easeOut' }}
              className="absolute inset-0 rounded-xl pointer-events-none border-2 border-amber-300/60"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.64, type: 'spring', damping: 10, stiffness: 300 }}
              className="w-9 h-12"
            >
              <PlantIcon count={charCount} className="w-full h-full" />
            </motion.div>
          </motion.div>
        </div>
        <motion.span
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.88 }}
          className="text-[9px] font-black text-amber-500 tracking-wider"
        >
          TODAY
        </motion.span>
      </div>
    )
  }

  if (isFilled) {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <div className="w-full h-15 rounded-xl flex items-center justify-center" style={goldStyle}>
          <div className="w-8 h-11">
            <PlantIcon count={charCount} className="w-full h-full" />
          </div>
        </div>
        <span className="text-[9px] font-medium text-amber-400/60">{day}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className="w-full h-15 rounded-xl flex items-center justify-center"
        style={{ background: '#F7F7F7', border: '1.5px dashed #E4E4E4' }}
      >
        <span className="text-[11px] font-bold text-gray-200">{day}</span>
      </div>
      <span className="text-[9px] text-transparent select-none">·</span>
    </div>
  )
}

interface Props {
  count: number
  teamId: number
  onDismiss: () => void
}

function Inner({ count, teamId, onDismiss }: Props) {
  const [hideToday, setHideToday] = useState(false)
  const hideTodayRef = useRef(false)
  const dismissed = useRef(false)

  const clampedCount = Math.min(count, TOTAL)
  const nextMilestone = [7, 14, 21, 30].find((m) => m > count) ?? 30
  const daysToNext = nextMilestone - count

  function toggleHideToday() {
    const next = !hideTodayRef.current
    hideTodayRef.current = next
    setHideToday(next)
  }

  function close() {
    if (dismissed.current) return
    dismissed.current = true
    if (hideTodayRef.current) {
      try {
        localStorage.setItem(skipKey(teamId), '1')
      } catch {
        /* noop */
      }
    }
    onDismiss()
  }

  useEffect(() => {
    const id = setTimeout(close, DISMISS_MS)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(17,17,17,0.78)' }}
        onClick={close}
      />

      {/* Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.78, y: 44 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 280, mass: 0.8 }}
          className="pointer-events-auto w-full max-w-[320px] max-h-[88vh] flex flex-col rounded-3xl overflow-hidden bg-white shadow-[0_32px_80px_rgba(0,0,0,0.32),0_8px_24px_rgba(0,0,0,0.14)]"
        >
          {/* Header */}
          <div
            className="px-6 pt-6 pb-5 relative overflow-hidden shrink-0"
            style={{ background: 'linear-gradient(135deg, #FEFCE8 0%, #F0FFF4 55%, #F0F8FF 100%)' }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18 }}
              className="absolute top-4 right-5 flex gap-2"
            >
              {['#F5CC5A', '#90D898', '#A0C8FF'].map((c, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ background: c, opacity: 0.65 + i * 0.1 }}
                />
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="text-[11px] font-bold tracking-[0.14em] uppercase text-gray-500/75 mb-1"
            >
              연속 성공 스트릭
            </motion.p>

            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, type: 'spring', damping: 18 }}
              className="flex items-baseline gap-2 mb-2"
            >
              <span className="font-black text-gray-900 leading-none" style={{ fontSize: 52 }}>
                {clampedCount}
              </span>
              <span className="text-[20px] font-bold text-gray-900">일째</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="flex items-center gap-2 flex-wrap"
            >
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/55 text-gray-700">
                {getMotivation(count)}
              </span>
              {daysToNext > 0 && count < TOTAL && (
                <span className="text-[11px] font-medium text-gray-500/70">
                  {nextMilestone}일까지 {daysToNext}일 남음
                </span>
              )}
            </motion.div>
          </div>

          {/* Stamp grid — scrollable */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ scrollbarWidth: 'none' } as React.CSSProperties}
          >
            <div className="px-5 pt-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[12px] font-bold text-gray-800">30일 스탬프 카드</p>
                <p className="text-[11px] font-semibold text-gray-400">
                  {clampedCount} / {TOTAL}
                </p>
              </div>

              {/* 4 × 8 grid */}
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: TOTAL }, (_, i) => (
                  <StampCell key={i} day={i + 1} count={clampedCount} />
                ))}
              </div>

              {/* Character legend */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="flex items-center justify-between mt-4 px-1"
              >
                {[
                  { count: 1, label: '1~3일' },
                  { count: 4, label: '4~10일' },
                  { count: 11, label: '11~20일' },
                  { count: 21, label: '21일~' },
                ].map(({ count: c, label }) => (
                  <div key={c} className="flex flex-col items-center gap-0.5">
                    <div className="w-5 h-7">
                      <PlantIcon count={c} className="w-full h-full" />
                    </div>
                    <span className="text-[8.5px] text-gray-300 font-medium">{label}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-5 py-3 flex items-center gap-2.5 border-t border-gray-100 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={toggleHideToday}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-150 active:scale-90 ${
                hideToday ? 'bg-gray-900 border-gray-900' : 'border-gray-300 bg-white'
              }`}
            >
              {hideToday && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M1.5 5l2.8 2.8 4.2-4.6"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
            <span
              className="text-[12px] font-medium text-gray-500 select-none cursor-pointer"
              onClick={toggleHideToday}
            >
              오늘 하루 안보기
            </span>
            <button
              onClick={close}
              className="ml-auto text-[12px] font-semibold text-gray-400 active:scale-95 transition-transform"
            >
              닫기
            </button>
          </div>

          {/* Countdown bar */}
          <div className="h-1 bg-gray-100 shrink-0">
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ delay: 0.1, duration: (DISMISS_MS - 100) / 1000, ease: 'linear' }}
              className="h-full origin-left bg-gray-900"
            />
          </div>
        </motion.div>
      </div>
    </>
  )
}

export function StreakCelebration({ count, teamId, onDismiss }: Props) {
  const [show, setShow] = useState(true)

  function handleDismiss() {
    setShow(false)
    setTimeout(onDismiss, 350)
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {show && <Inner count={count} teamId={teamId} onDismiss={handleDismiss} />}
    </AnimatePresence>,
    document.body
  )
}
