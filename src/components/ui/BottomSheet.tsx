'use client'

import { motion, type PanInfo } from 'framer-motion'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

interface BottomSheetProps {
  onClose: () => void
  children: ReactNode
  className?: string
}

/** 아래에서 스프링으로 올라오는 바텀시트. 열림 여부는 호출부에서 조건부 렌더로 제어한다 */
export function BottomSheet({ onClose, children, className = '' }: BottomSheetProps) {
  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > 80 || info.velocity.y > 400) onClose()
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
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 320, mass: 0.8 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={handleDragEnd}
        className={`fixed bottom-0 left-0 right-0 z-50 max-w-97.5 mx-auto bg-white rounded-t-3xl px-6 pt-4 pb-9 cursor-grab active:cursor-grabbing ${className}`}
      >
        <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5" />
        {children}
      </motion.div>
    </>,
    document.body
  )
}
