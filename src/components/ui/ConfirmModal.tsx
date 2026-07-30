'use client'

import { motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { FiAlertTriangle } from 'react-icons/fi'

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
  const accentText = confirmDanger ? 'text-status-red' : 'text-primary'
  const accentBg = confirmDanger ? 'bg-status-red/10' : 'bg-primary/10'
  const confirmBg = confirmDanger ? 'bg-status-red' : 'bg-primary'

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 12 }}
        transition={{ type: 'spring', damping: 26, stiffness: 380, mass: 0.5 }}
        className="relative w-full max-w-xs bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] p-6 flex flex-col items-center text-center"
      >
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${accentBg}`}>
          <FiAlertTriangle size={26} className={accentText} />
        </div>
        <p className={`text-[17px] font-bold mb-1 ${accentText}`}>{title}</p>
        <p className="text-[13px] text-muted leading-relaxed mb-5">{message}</p>
        <div className="flex gap-2 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-neutral-30 text-[14px] font-semibold text-gray-700 transition-colors hover:bg-neutral-40"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-xl text-[14px] font-semibold text-white transition-opacity hover:opacity-85 ${confirmBg}`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}
