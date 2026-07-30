'use client'

import { AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useNewTodo } from '@/hooks/useNewTodo'
import { useAuth } from '@/store/authStore'
import { TimePicker } from './components/TimePicker'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Spinner } from '@/components/ui/Spinner'
import { MemberAvatar } from '@/components/ui/MemberAvatar'

function formatDisplayTime(value: string): string {
  if (!value) return ''
  const [h, m] = value.split(':').map(Number)
  const label = h < 12 ? '오전' : '오후'
  return `${label} ${h % 12 || 12}:${m.toString().padStart(2, '0')}`
}

export default function TodoNewPage() {
  const router = useRouter()
  const params = useParams()
  const teamId = Number(params.teamId)
  const { token } = useAuth()

  const [showTimePicker, setShowTimePicker] = useState(false)

  const {
    members,
    isMembersLoading,
    title,
    setTitle,
    deadline,
    setDeadline,
    description,
    setDescription,
    excludedIds,
    toggleExclude,
    error,
    setError,
    isLoading,
    handleSubmit,
  } = useNewTodo(teamId, token)

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-fade-up">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <BackButton onClick={() => router.back()} />
          <div className="min-w-0">
            <h1 className="text-[20px] font-black text-ink leading-tight">할 일 만들기</h1>
            <p className="text-[12px] text-muted mt-0.5">오늘의 할 일을 추가해 주세요</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-[13px] font-semibold text-gray-700 tracking-wide">
            제목
          </label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (error) setError('')
            }}
            placeholder="할 일 제목을 입력해주세요"
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-semibold text-gray-700 tracking-wide">마감 시간</p>
          <button
            type="button"
            onClick={() => {
              setShowTimePicker(true)
              if (error) setError('')
            }}
            className={`w-full px-4 py-3.25 rounded-[14px] border-[1.5px] text-[14px] text-left transition-all duration-200 ${deadline ? 'border-primary bg-white text-ink font-medium' : 'border-border bg-white text-muted font-light'}`}
          >
            <div className="flex items-center justify-between">
              <span>{deadline ? formatDisplayTime(deadline) : '시간을 선택해주세요'}</span>
              <svg
                className="w-4 h-4 text-muted shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="description"
            className="text-[13px] font-semibold text-gray-700 tracking-wide"
          >
            설명 <span className="ml-1 text-[12px] font-normal text-muted">(선택)</span>
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="할 일에 대한 설명을 입력해주세요"
            rows={3}
          />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[13px] font-semibold text-gray-700 tracking-wide">팀원</p>
          {isMembersLoading ? (
            <div className="flex justify-center py-6">
              <Spinner size="sm" />
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {members.map((member) => {
                const isExcluded = excludedIds.has(member.userId)
                return (
                  <li
                    key={member.userId}
                    className={`flex items-center justify-between bg-white rounded-[14px] border border-border px-4 py-3.5 transition-all duration-200 ${isExcluded ? 'opacity-40' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <MemberAvatar
                        profileImageUrl={member.profileImageUrl}
                        nickname={member.nickname}
                        size={36}
                      />
                      <span className="text-[14px] font-medium text-ink">{member.nickname}</span>
                    </div>
                    {isExcluded ? (
                      <button
                        onClick={() => toggleExclude(member.userId)}
                        className="text-[13px] font-semibold text-muted"
                      >
                        제외됨
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleExclude(member.userId)}
                        className="px-4 py-1.5 rounded-[10px] border border-border text-[13px] font-semibold text-ink transition-all duration-200 hover:border-primary hover:text-primary"
                      >
                        제외
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {error && (
          <p className="text-[13px] text-status-red bg-status-red/10 rounded-[10px] px-4 py-2.5">
            {error}
          </p>
        )}
      </div>

      <div className="px-6 py-5 border-t border-border flex flex-col gap-3">
        <Button onClick={handleSubmit} disabled={isLoading || isMembersLoading}>
          {isLoading ? '생성 중...' : '생성하기'}
        </Button>
        <Button variant="secondary" onClick={() => router.back()}>
          돌아가기
        </Button>
      </div>

      <AnimatePresence>
        {showTimePicker && (
          <TimePicker
            value={deadline}
            onChange={(v) => {
              setDeadline(v)
              if (error) setError('')
            }}
            onClose={() => setShowTimePicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
