'use client'

import { useParams, usePathname } from 'next/navigation'
import { ChatBot } from '@/components/ChatBot'
import { useAuth } from '@/store/authStore'

export default function TeamIdLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  const params = useParams()
  const teamId = Number(params.teamId)
  const pathname = usePathname()

  const hideFab =
    pathname.endsWith('/chat') ||
    /\/todos\/\d+$/.test(pathname) ||
    pathname.endsWith('/certify') ||
    /\/teams\/\d+$/.test(pathname)

  return (
    <>
      {children}
      {token && teamId > 0 && !hideFab && <ChatBot token={token} teamId={teamId} />}
    </>
  )
}
