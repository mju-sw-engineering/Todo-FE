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
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-fade-up">
      {/* 헤더 (스크롤 고정) */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors shrink-0"
            aria-label="뒤로가기"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="text-[20px] font-black text-ink leading-tight">팀 참여하기</h1>
            <p className="text-[12px] text-muted mt-0.5">초대 코드를 입력해 팀에 참여하세요</p>
          </div>
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
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
      </div>

      {/* 바텀 버튼 (항상 고정) */}
      <div className="px-6 py-5 border-t border-border flex flex-col gap-3">
        <AuthButton form="team-join-form" disabled={isLoading || inviteCode.trim().length === 0}>
          {isLoading ? '참여 중...' : '참여하기'}
        </AuthButton>
        <button
          onClick={() => router.back()}
          className="w-full py-3.75 bg-gray-100 text-gray-700 text-[15px] font-semibold rounded-[14px] transition-all duration-200 hover:bg-gray-200"
        >
          돌아가기
        </button>
      </div>
    </div>
  )
}
