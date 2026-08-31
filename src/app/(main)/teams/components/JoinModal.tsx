'use client'

import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { joinTeam } from '@/services/teamService'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface JoinModalProps {
  token: string
  onClose: () => void
  onSuccess: (teamId: number) => void
}

export function JoinModal({ token, onClose, onSuccess }: JoinModalProps) {
  const [inviteCode, setInviteCode] = useState('')
  const { isLoading, run } = useAsyncTask()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    await run(
      async () => {
        const result = await joinTeam({ inviteCode: inviteCode.trim().toUpperCase() }, token)
        onSuccess(result.teamId)
      },
      {
        fallback: '팀 참여 중 오류가 발생했습니다.',
        statusMessages: { 404: '존재하지 않는 초대 코드입니다.', 409: '이미 참여한 팀입니다.' },
      }
    )
  }

  return createPortal(
    <>
      <motion.div
        className="fixed inset-0 z-50 bg-black/40 touch-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 max-w-app mx-auto bg-white rounded-t-[28px] px-5 pt-6 pb-10"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320, mass: 0.8 }}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-6" />
        <p className="text-[13px] text-muted text-center mb-6">
          초대 코드를 입력해 팀에 참여하세요
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            ref={inputRef}
            label="초대 코드"
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="예: AB12CD34"
            maxLength={8}
          />
          <Button
            type="submit"
            size="lg"
            className="mt-1"
            disabled={isLoading || inviteCode.trim().length === 0}
          >
            {isLoading ? '참여 중...' : '참여하기'}
          </Button>
        </form>
        <button
          onClick={onClose}
          className="block w-full text-center mt-4 text-[14px] font-medium text-muted hover:text-ink transition-colors duration-200"
        >
          돌아가기
        </button>
      </motion.div>
    </>,
    document.body
  )
}
