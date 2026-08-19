'use client'

import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/lib/apiError'
import { getOrCreateInviteLink } from '@/services/teamService'

interface TeamInviteSectionProps {
  teamId: number
  token: string
  onToast: (msg: string) => void
}

export function TeamInviteSection({ teamId, token, onToast }: TeamInviteSectionProps) {
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copyDone, setCopyDone] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchInviteLink() {
      setLoading(true)
      setError(null)
      try {
        const res = await getOrCreateInviteLink(teamId, token)
        // 백엔드가 반환하는 inviteLink의 호스트는 신경 쓰지 않는다 — 토큰만 뽑아서
        // 우리 프론트의 실제 받는 페이지(/teams/invite) 주소로 다시 만든다. 그래야
        // 복사한 링크를 눌렀을 때 로그인 API가 그대로 JSON을 뱉는 대신 우리 화면이 뜬다.
        const linkToken = new URL(res.inviteLink).searchParams.get('token')
        if (!linkToken) throw new Error('초대 링크에 토큰이 없습니다.')
        if (!cancelled) setInviteLink(`${window.location.origin}/teams/invite?token=${linkToken}`)
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, '초대 링크를 불러오지 못했습니다.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchInviteLink()
    return () => {
      cancelled = true
    }
  }, [teamId, token])

  async function handleCopy() {
    if (!inviteLink) return
    await navigator.clipboard.writeText(inviteLink)
    setCopyDone(true)
    onToast('초대 링크가 복사되었습니다.')
    setTimeout(() => setCopyDone(false), 2000)
  }

  return (
    <div className="bg-white rounded-[18px] border border-border mb-3 px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-ink">초대 링크</p>
          <p className="text-[12px] text-muted mt-0.5 truncate">
            {loading ? '링크를 만드는 중...' : error ? error : inviteLink}
          </p>
        </div>
        <button
          onClick={handleCopy}
          disabled={loading || !inviteLink}
          className={`text-[12px] font-semibold shrink-0 px-3 py-1.5 rounded-lg transition-colors duration-200 disabled:opacity-50 ${copyDone ? 'text-[#2d7a56] bg-[#eaf6ef]' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}
        >
          {copyDone ? '복사됨 ✓' : '복사'}
        </button>
      </div>
      <p className="text-[11px] text-muted mt-2.5">
        이 링크로 누구나 팀에 참여할 수 있어요 · 7일간 유효
      </p>
    </div>
  )
}
