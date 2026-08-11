'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { PageLoader } from '@/components/ui/PageLoader'

/**
 * 팀 홈은 할 일 목록이다 — 팀에 들어오면 바로 오늘의 할 일을 본다.
 * 팀원·초대 등 관리 기능은 /teams/[teamId]/settings로 분리했다.
 */
export default function TeamHomeRedirect() {
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    router.replace(`/teams/${params.teamId}/todos`)
  }, [router, params.teamId])

  return <PageLoader />
}
