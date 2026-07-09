'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { joinTeam } from '@/services/teamService'
import { useAuth } from '@/store/authStore'

export default function TeamJoinPage() {
  const router = useRouter()
  const { token } = useAuth()

  const [inviteCode, setInviteCode] = useState('')
  const { isLoading, error, setError, run } = useAsyncTask()

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!token) {
      setError('로그인이 필요합니다.')
      return
    }

    await run(
      async () => {
        const result = await joinTeam({ inviteCode: inviteCode.trim().toUpperCase() }, token)
        router.push(`/teams/${result.teamId}`)
      },
      {
        fallback: '팀 참여 중 오류가 발생했습니다.',
        statusMessages: { 404: '존재하지 않는 초대 코드입니다.', 409: '이미 참여한 팀입니다.' },
      }
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-fade-up">
      {/* 헤더 (스크롤 고정) */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <BackButton onClick={() => router.back()} />
          <div className="min-w-0">
            <h1 className="text-[20px] font-black text-ink leading-tight">팀 참여하기</h1>
            <p className="text-[12px] text-muted mt-0.5">초대 코드를 입력해 팀에 참여하세요</p>
          </div>
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <form id="team-join-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
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
        <Button
          type="submit"
          form="team-join-form"
          size="lg"
          disabled={isLoading || inviteCode.trim().length === 0}
        >
          {isLoading ? '참여 중...' : '참여하기'}
        </Button>
        <Button variant="secondary" size="lg" onClick={() => router.back()}>
          돌아가기
        </Button>
      </div>
    </div>
  )
}
