'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AuthButton } from '@/components/ui/AuthButton'
import { AuthInput } from '@/components/ui/AuthInput'
import { ApiError } from '@/lib/apiClient'
import { joinTeam } from '@/services/teamService'
import { useAuth } from '@/store/authStore'

export default function TeamJoinPage() {
  const router = useRouter()
  const { token } = useAuth()

  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setError('')
    if (!token) {
      setError('로그인이 필요합니다.')
      return
    }

    setIsLoading(true)
    try {
      const result = await joinTeam({ inviteCode: inviteCode.trim().toUpperCase() }, token)
      router.push(`/teams/${result.teamId}`)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) setError('존재하지 않는 초대 코드입니다.')
        else if (err.status === 409) setError('이미 참여한 팀입니다.')
        else setError(err.message)
      } else {
        setError('팀 참여 중 오류가 발생했습니다.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-white px-5 pt-8 pb-36 animate-fade-up md:flex-none md:rounded-[28px] md:border md:border-border md:shadow-[0_8px_40px_rgba(91,79,207,0.10)] md:px-9 md:py-11">
      <h1 className="text-[22px] font-bold text-ink text-center">팀 참여하기</h1>
      <p className="text-[13px] text-muted text-center mt-1 mb-8">
        초대 코드를 입력해 팀에 참여하세요
      </p>

      <form id="team-join-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
        <AuthInput
          id="inviteCode"
          label="초대 코드"
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="초대 코드 8자리를 입력해 주세요"
          maxLength={8}
          required
          hint={error || undefined}
        />
      </form>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border px-5 py-4 flex flex-col gap-2">
        <AuthButton form="team-join-form" disabled={isLoading || inviteCode.trim().length === 0}>
          {isLoading ? '참여 중...' : '참여하기'}
        </AuthButton>
        <button
          onClick={() => router.back()}
          className="w-full py-4 bg-primary-light text-primary text-[15px] font-semibold rounded-[14px] transition-all duration-200 hover:bg-[#e0daf8]"
        >
          돌아가기
        </button>
      </div>
    </div>
  )
}
