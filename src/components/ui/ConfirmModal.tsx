'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'

export interface ConfirmModalProps {
  title: string
  message: string
  confirmLabel: string
  confirmDanger?: boolean
  confirmDisabled?: boolean
  confirmPending?: boolean
  children?: ReactNode
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmDanger,
  confirmDisabled,
  confirmPending,
  children,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const accentText = confirmDanger ? 'text-status-red' : 'text-primary'
  const accentBg = confirmDanger ? 'bg-status-red/10' : 'bg-primary/10'
  const confirmBg = confirmDanger ? 'bg-status-red' : 'bg-primary'

  const cancelRef = useRef<HTMLButtonElement>(null)

  // 열릴 때 취소 버튼에 포커스 — 실수로 확인을 누르지 않도록.
  // children이 있으면(비밀번호 입력 등) 자식의 autoFocus를 존중한다.
  useEffect(() => {
    if (!children) cancelRef.current?.focus()
  }, [children])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !confirmPending) onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel, confirmPending])

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div className="fixed inset-0 bg-black/50" onClick={confirmPending ? undefined : onCancel} />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 12 }}
        transition={{ type: 'spring', damping: 26, stiffness: 380, mass: 0.5 }}
        className="relative w-full max-w-xs bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] p-6 flex flex-col items-center text-center"
      >
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${accentBg}`}>
          <FiAlertTriangle size={26} className={accentText} />
        </div>
        <p id="confirm-modal-title" className={`text-[17px] font-bold mb-1 ${accentText}`}>
          {title}
        </p>
        <p className={`text-[13px] text-muted leading-relaxed ${children ? 'mb-4' : 'mb-5'}`}>
          {message}
        </p>
        {children && <div className="w-full mb-5">{children}</div>}
        <div className="flex gap-2 w-full">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={confirmPending}
            className="flex-1 py-3 rounded-xl bg-neutral-30 text-[14px] font-semibold text-gray-700 transition-colors hover:bg-neutral-40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled || confirmPending}
            className={`flex-1 py-3 rounded-xl text-[14px] font-semibold text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40 ${confirmBg}`}
          >
            {confirmPending ? '처리 중…' : confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}
