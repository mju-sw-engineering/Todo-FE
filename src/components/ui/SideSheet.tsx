'use client'

import { motion, type PanInfo } from 'framer-motion'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

interface SideSheetProps {
  onClose: () => void
  children: ReactNode
  className?: string
}

/** 오른쪽에서 스프링으로 밀려 들어오는 사이드 시트. 열림 여부는 호출부에서 조건부 렌더로 제어한다 */
export function SideSheet({ onClose, children, className = '' }: SideSheetProps) {
  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > 80 || info.velocity.x > 400) onClose()
  }

  return createPortal(
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-black/35"
        onClick={onClose}
      />
      <div className="pointer-events-none fixed inset-0 z-50 flex justify-end">
        <div className="relative mx-auto h-full w-full max-w-97.5">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320, mass: 0.8 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0, right: 0.5 }}
            onDragEnd={handleDragEnd}
            className={`pointer-events-auto absolute right-0 top-0 h-full w-[78%] max-w-72 cursor-grab overflow-y-auto rounded-l-3xl bg-white px-5 pb-8 pt-[calc(env(safe-area-inset-top)+1.25rem)] shadow-[-12px_0_32px_rgba(0,0,0,0.15)] active:cursor-grabbing ${className}`}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </>,
    document.body
  )
}
