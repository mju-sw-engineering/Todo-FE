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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
        if (err.status === 404) {
          setError('존재하지 않는 초대 코드입니다.')
        } else if (err.status === 409) {
          setError('이미 참여한 팀입니다.')
        } else {
          setError(err.message)
        }
      } else {
        setError('팀 참여 중 오류가 발생했습니다.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-white px-6 py-10 animate-fade-up md:flex-none md:rounded-[28px] md:border md:border-border md:shadow-[0_8px_40px_rgba(91,79,207,0.10)] md:px-9 md:py-11">
      <div className="text-center mb-9">
        <h1 className="text-[22px] font-bold text-ink tracking-tight">팀 참여하기</h1>
        <p className="mt-2 text-[14px] text-muted">초대 코드를 입력해 팀에 참여하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

        <AuthButton disabled={isLoading || inviteCode.trim().length === 0}>
          {isLoading ? '참여 중...' : '참여하기'}
        </AuthButton>
      </form>

      <button
        onClick={() => router.back()}
        className="block w-full text-center mt-auto pt-8 text-[14px] font-medium text-ink hover:text-primary transition-colors duration-200"
      >
        돌아가기
      </button>
    </div>
  )
}
