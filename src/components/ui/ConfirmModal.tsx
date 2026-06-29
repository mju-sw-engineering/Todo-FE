'use client'

import { motion } from 'framer-motion'
import { createPortal } from 'react-dom'

export interface ConfirmModalProps {
  title: string
  message: string
  confirmLabel: string
  confirmDanger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmDanger,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-6 px-4">
      <div className="fixed inset-0 bg-black/40" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ type: 'spring', damping: 26, stiffness: 380, mass: 0.5 }}
        className="relative w-full max-w-sm bg-white rounded-[22px] shadow-[0_8px_40px_rgba(0,0,0,0.18)] p-6"
      >
        <p className="text-[16px] font-bold text-ink mb-1">{title}</p>
        <p className="text-[13px] text-muted leading-relaxed mb-5">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-[14px] font-semibold text-gray-700 transition-colors hover:bg-gray-200"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-xl text-[14px] font-semibold text-white transition-opacity hover:opacity-85 ${confirmDanger ? 'bg-red-500' : 'bg-gray-900'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}
