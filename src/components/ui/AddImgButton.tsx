'use client'

import { useState } from 'react'
import { FiCamera } from 'react-icons/fi'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

interface AddImgButtonProps {
  imageUrl: string | null
  onAddClick: () => void
  onRemove: () => void
  className?: string
  style?: React.CSSProperties
}

export function AddImgButton({
  imageUrl,
  onAddClick,
  onRemove,
  className = '',
  style,
}: AddImgButtonProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  function handleClick() {
    if (imageUrl) {
      setIsDeleteModalOpen(true)
    } else {
      onAddClick()
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`w-full rounded-[18px] bg-gray-50 overflow-hidden flex items-center justify-center bg-cover bg-center shrink-0 transition-colors hover:bg-gray-100 ${className}`}
        style={{ ...style, ...(imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}) }}
      >
        {!imageUrl && (
          <div className="flex flex-col items-center gap-2">
            <FiCamera size={28} className="text-gray-300" />
            <p className="text-[13px] text-gray-300 select-none">사진을 선택하거나 촬영하세요</p>
          </div>
        )}
      </button>

      {isDeleteModalOpen && (
        <ConfirmModal
          title="사진을 삭제할까요?"
          message="선택한 인증샷이 삭제됩니다."
          confirmLabel="삭제"
          confirmDanger
          onConfirm={() => {
            onRemove()
            setIsDeleteModalOpen(false)
          }}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}
    </>
  )
}
