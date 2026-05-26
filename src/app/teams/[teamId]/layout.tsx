'use client'

import { useParams } from 'next/navigation'
import { ChatBot } from '@/components/ChatBot'
import { useAuth } from '@/store/authStore'

export default function TeamIdLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  const params = useParams()
  const teamId = Number(params.teamId)

  return (
    <>
      {children}
      {token && teamId > 0 && <ChatBot token={token} teamId={teamId} />}
    </>
  )
}
