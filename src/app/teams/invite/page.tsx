'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef } from 'react'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { joinTeamByInviteLink } from '@/services/teamService'
import { useAuth } from '@/store/authStore'

/** 초대 링크(`/teams/invite?token=...`)로 들어왔을 때 자동으로 팀 참여를 시도한다 */
export default function TeamInvitePage() {
  return (
    <Suspense fallback={null}>
      <TeamInvitePageContent />
    </Suspense>
  )
}

function TeamInvitePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token } = useAuth()
  const linkToken = searchParams.get('token')
  const { isLoading, error, setError, run } = useAsyncTask(true)
  const attempted = useRef(false)

  useEffect(() => {
    if (attempted.current) return
    if (!linkToken) {
      setError('초대 링크가 올바르지 않습니다.')
      return
    }
    if (!token) return

    attempted.current = true
    run(
      async () => {
        const result = await joinTeamByInviteLink(linkToken, token)
        router.replace(`/teams/${result.teamId}`)
      },
      {
        fallback: '팀 참여 중 오류가 발생했습니다.',
        statusMessages: {
          400: '초대 링크에 토큰이 없습니다.',
          404: '유효하지 않거나 만료된 초대 링크입니다.',
          409: '이미 참여한 팀입니다.',
        },
      }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkToken, token])

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-fade-up">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <BackButton onClick={() => router.push('/teams')} />
          <div className="min-w-0">
            <h1 className="text-[20px] font-black text-ink leading-tight">팀 참여하기</h1>
            <p className="text-[12px] text-muted mt-0.5">초대 링크로 팀에 참여합니다</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
        {isLoading ? (
          <>
            <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-[14px] text-muted">팀에 참여하는 중...</p>
          </>
        ) : error ? (
          <>
            <p className="text-[14px] font-semibold text-status-red">{error}</p>
            <Button variant="secondary" size="lg" onClick={() => router.push('/teams')}>
              팀 목록으로
            </Button>
          </>
        ) : null}
      </div>
    </div>
  )
}
