'use client'

import { useState } from 'react'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { inviteByEmail } from '@/services/teamService'

interface TeamInviteSectionProps {
  teamId: number
  token: string
  inviteCode: string | undefined
  onToast: (msg: string) => void
}

export function TeamInviteSection({ teamId, token, inviteCode, onToast }: TeamInviteSectionProps) {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [copyDone, setCopyDone] = useState(false)
  const { isLoading: inviting, error: inviteError, setError: setInviteError, run } = useAsyncTask()

  async function handleInvite() {
    if (!inviteEmail.trim()) return
    await run(
      async () => {
        await inviteByEmail(teamId, [inviteEmail.trim()], token)
        setInviteEmail('')
        setInviteOpen(false)
        onToast('초대 메일이 발송되었습니다.')
      },
      {
        fallback: '초대에 실패했습니다.',
        statusMessages: {
          400: '올바른 이메일 주소를 입력해 주세요.',
          401: '로그인이 만료되었습니다.',
          403: '권한이 없습니다.',
          500: '메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.',
        },
      }
    )
  }

  async function handleCopyInviteCode() {
    if (!inviteCode) return
    await navigator.clipboard.writeText(inviteCode)
    setCopyDone(true)
    setTimeout(() => setCopyDone(false), 2000)
  }

  return (
    <>
      <div className="bg-white rounded-[18px] border border-border mb-3 overflow-hidden">
        <button
          onClick={() => {
            setInviteOpen((p) => !p)
            setInviteError(null)
          }}
          className="w-full flex items-center gap-3 px-4 py-4 transition-colors hover:bg-gray-50"
        >
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="flex-1 text-left text-[14px] font-semibold text-ink">이메일로 초대</p>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${inviteOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {inviteOpen && (
          <div className="border-t border-border px-4 py-4 flex flex-col gap-2.5">
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                placeholder="example@email.com"
                className="flex-1 border border-border rounded-xl px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:border-gray-900 transition-colors"
                disabled={inviting}
              />
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="px-4 py-2.5 bg-gray-900 text-white text-[13px] font-semibold rounded-xl disabled:opacity-50 transition-opacity hover:opacity-85 shrink-0"
              >
                {inviting ? '발송 중' : '초대'}
              </button>
            </div>
            {inviteError && <p className="text-[12px] font-semibold text-red-500">{inviteError}</p>}
          </div>
        )}
      </div>

      {inviteCode && (
        <button
          onClick={handleCopyInviteCode}
          className="w-full flex items-center justify-between bg-white rounded-[18px] border border-border px-4 py-4 mb-3 transition-all duration-200 hover:border-gray-300 hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] active:scale-[0.99]"
        >
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
            <div className="text-left">
              <p className="text-[12px] text-muted">초대 코드</p>
              <p className="text-[14px] font-semibold text-ink">{inviteCode}</p>
            </div>
          </div>
          <span
            className={`text-[12px] font-semibold shrink-0 ml-2 px-3 py-1.5 rounded-lg transition-colors duration-200 ${copyDone ? 'text-[#2d7a56] bg-[#eaf6ef]' : 'text-gray-700 bg-gray-100'}`}
          >
            {copyDone ? '복사됨 ✓' : '복사'}
          </span>
        </button>
      )}
    </>
  )
}
