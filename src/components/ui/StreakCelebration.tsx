'use client'

import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { PlantIcon, getPlantStageLabel } from './PlantIcon'

const DISMISS_MS = 4000

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

const SPARKLES = [
  { x: -52, y: -88, delay: 0.32, color: '#fbbf24', size: 9 },
  { x: 50, y: -82, delay: 0.44, color: '#a78bfa', size: 11 },
  { x: -73, y: -38, delay: 0.28, color: '#34d399', size: 7 },
  { x: 67, y: -42, delay: 0.52, color: '#f472b6', size: 9 },
  { x: -30, y: -102, delay: 0.38, color: '#60a5fa', size: 8 },
  { x: 36, y: -97, delay: 0.56, color: '#fb923c', size: 10 },
  { x: -90, y: -62, delay: 0.42, color: '#fde68a', size: 7 },
  { x: 84, y: -68, delay: 0.36, color: '#c4b5fd', size: 12 },
  { x: 4, y: -112, delay: 0.48, color: '#f9a8d4', size: 8 },
  { x: -97, y: -18, delay: 0.6, color: '#86efac', size: 9 },
  { x: 92, y: -16, delay: 0.3, color: '#fbbf24', size: 7 },
  { x: -18, y: -118, delay: 0.5, color: '#818cf8', size: 10 },
]

function getMotivation(count: number): string {
  if (count >= 30) return '한 달 연속! 신화 등극 👑'
  if (count >= 21) return '21일 달성! 전설이에요 🌟'
  if (count >= 14) return '2주 연속! 믿을 수 없어요!'
  if (count >= 7) return '일주일 연속! 최고예요 🎯'
  if (count >= 3) return '3일 연속! 훌륭해요!'
  if (count >= 1) return '첫 번째 스트릭! 시작이 반 🌱'
  return '계속 도전하세요!'
}

interface Props {
  count: number
  teamId: number
  onDismiss: () => void
}

function Inner({ count, teamId, onDismiss }: Props) {
  const [displayCount, setDisplayCount] = useState(0)
  const [hideToday, setHideToday] = useState(false)
  const hideTodayRef = useRef(false)
  const stageLabel = getPlantStageLabel(count)
  const dismissed = useRef(false)

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

  // Count-up
  useEffect(() => {
    if (count === 0) return
    const steps = Math.min(count, 24)
    const interval = 720 / steps
    let current = 0
    const id = setInterval(() => {
      current += Math.ceil(count / steps)
      if (current >= count) {
        setDisplayCount(count)
        clearInterval(id)
      } else {
        setDisplayCount(current)
      }
    }, interval)
    return () => clearInterval(id)
  }, [count])

  // Auto-dismiss
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
        transition={{ duration: 0.28 }}
        className="fixed inset-0 z-50"
        style={{ background: 'radial-gradient(ellipse at 50% 60%, #2e1065cc 0%, #0f0720ee 100%)' }}
        onClick={close}
      />

      {/* Centering wrapper */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.72, y: 48 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 24 }}
          transition={{ type: 'spring', damping: 18, stiffness: 260, mass: 0.75 }}
          className="pointer-events-auto w-72"
          onClick={close}
        >
          {/* Card */}
          <div className="rounded-3xl overflow-hidden bg-white shadow-[0_28px_80px_rgba(91,79,207,0.4),0_8px_28px_rgba(0,0,0,0.18)]">
            {/* Header */}
            <div
              className="relative h-56 flex items-center justify-center overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #f5f3ff 0%, #ede9fe 55%, #ddd6fe 100%)',
              }}
            >
              {/* Deep glow */}
              <motion.div
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 0.55, scale: 1.4 }}
                transition={{ delay: 0.2, duration: 1.0, ease: 'easeOut' }}
                className="absolute w-44 h-44 rounded-full blur-3xl"
                style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
              />

              {/* Pulse rings */}
              {[0.25, 0.45].map((delay, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.2, opacity: 0.7 }}
                  animate={{ scale: 2.6 - i * 0.2, opacity: 0 }}
                  transition={{ delay, duration: 1.3, ease: 'easeOut' }}
                  className="absolute w-24 h-24 rounded-full"
                  style={{ border: `${2 - i}px solid rgba(139,92,246,${0.4 - i * 0.1})` }}
                />
              ))}

              {/* Sparkle particles */}
              <div className="absolute inset-0 flex items-end justify-center pb-10">
                {SPARKLES.map((sp, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{
                      x: sp.x,
                      y: sp.y,
                      scale: [0, 1.4, 0.9, 0],
                      opacity: [0, 1, 0.85, 0],
                    }}
                    transition={{
                      delay: sp.delay,
                      duration: 1.0,
                      ease: 'easeOut',
                      times: [0, 0.3, 0.6, 1],
                    }}
                    className="absolute rounded-full"
                    style={{
                      width: sp.size,
                      height: sp.size,
                      backgroundColor: sp.color,
                      boxShadow: `0 0 ${sp.size * 1.5}px ${sp.color}99`,
                    }}
                  />
                ))}
              </div>

              {/* Plant */}
              <motion.div
                initial={{ scale: 0.15, y: 36, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{
                  delay: 0.12,
                  type: 'spring',
                  damping: 11,
                  stiffness: 180,
                  mass: 0.6,
                }}
                className="relative z-10 w-32 h-40"
                style={{ filter: 'drop-shadow(0 10px 22px rgba(91,79,207,0.35))' }}
              >
                <PlantIcon count={count} />
              </motion.div>

              {/* Shimmer overlay on header */}
              <motion.div
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: '200%', opacity: [0, 0.25, 0] }}
                transition={{ delay: 0.7, duration: 0.9, ease: 'easeInOut' }}
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)',
                  zIndex: 20,
                }}
              />
            </div>

            {/* Text body */}
            <div className="px-6 pt-5 pb-2 text-center">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.52, duration: 0.38 }}
                className="text-[11px] font-bold tracking-[0.18em] uppercase mb-2"
                style={{ color: '#7c3aed' }}
              >
                🔥 연속 성공 스트릭
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.55 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.58, type: 'spring', damping: 10, stiffness: 220 }}
                className="flex items-baseline justify-center gap-2 mb-3"
              >
                <span
                  className="font-black leading-none"
                  style={{
                    fontSize: '72px',
                    background: 'linear-gradient(145deg, #7c3aed 0%, #a78bfa 45%, #5b21b6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: 'none',
                    filter: 'drop-shadow(0 2px 8px rgba(124,58,237,0.25))',
                  }}
                >
                  {displayCount}
                </span>
                <span className="text-[26px] font-bold" style={{ color: '#4c1d95' }}>
                  일!
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.72, duration: 0.38 }}
                className="flex items-center justify-center gap-2 flex-wrap pb-4"
              >
                <span
                  className="text-[12px] font-bold px-3 py-1 rounded-full"
                  style={{ background: '#f5f3ff', color: '#7c3aed' }}
                >
                  {stageLabel} 단계
                </span>
                <span className="text-[12px] font-medium" style={{ color: '#6b7280' }}>
                  {getMotivation(count)}
                </span>
              </motion.div>
            </div>

            {/* "오늘 하루 안보기" checkbox */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.35 }}
              className="px-5 py-3 flex items-center gap-2.5 border-t border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={toggleHideToday}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-150 active:scale-90 ${
                  hideToday ? 'bg-primary border-primary shadow-sm' : 'border-gray-300 bg-white'
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
                className="text-[12px] font-medium select-none cursor-pointer"
                style={{ color: '#6b7280' }}
                onClick={toggleHideToday}
              >
                오늘 하루 안보기
              </span>
            </motion.div>

            {/* Progress / countdown bar */}
            <div className="h-1 bg-gray-100">
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ delay: 0.1, duration: (DISMISS_MS - 100) / 1000, ease: 'linear' }}
                className="h-full origin-left"
                style={{ background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }}
              />
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.9, duration: 0.4 }}
            className="text-center text-white text-[11px] mt-3 font-medium select-none"
          >
            탭하면 닫혀요
          </motion.p>
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
