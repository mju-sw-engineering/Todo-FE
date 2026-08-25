'use client'

import { AnimatePresence } from 'framer-motion'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { useNewTodo } from '@/hooks/useNewTodo'
import { useAuth } from '@/store/authStore'
import { DeadlinePicker } from './components/DeadlinePicker'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Spinner } from '@/components/ui/Spinner'
import { MemberAvatar } from '@/components/ui/MemberAvatar'
import { PageLoader } from '@/components/ui/PageLoader'
import { DAYS_KO } from '@/lib/dateUtils'

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatDeadlineLong(date: Date): string {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const dayLabel = isSameDay(date, today)
    ? '오늘'
    : isSameDay(date, tomorrow)
      ? '내일'
      : DAYS_KO[date.getDay()]

  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours < 12 ? '오전' : '오후'
  const hour12 = hours % 12 || 12
  return `${dayLabel} · ${ampm} ${hour12}:${minutes.toString().padStart(2, '0')}`
}

function formatDeadlineShort(date: Date): string {
  const dayInitial = DAYS_KO[date.getDay()].charAt(0)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${dayInitial} ${hours}:${minutes}`
}

function TodoNewContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const teamId = Number(params.teamId)
  const { token } = useAuth()

  const [pickerTarget, setPickerTarget] = useState<'common' | number | null>(null)

  const {
    members,
    isMembersLoading,
    title,
    setTitle,
    description,
    setDescription,
    commonDeadline,
    setCommonDeadline,
    memberDrafts,
    toggleExclude,
    toggleExpand,
    setMemberTitle,
    setMemberDeadlineMode,
    setMemberCustomDeadline,
    isLoading,
    handleSubmit,
  } = useNewTodo(teamId, token, searchParams.get('date'))

  const anyExpanded = members.some(
    (member) => !memberDrafts[member.userId]?.excluded && memberDrafts[member.userId]?.expanded
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-fade-up">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <BackButton onClick={() => router.back()} />
          <div className="min-w-0">
            <h1 className="text-[20px] font-black text-ink leading-tight">새 할 일</h1>
            <p className="text-[12px] text-muted mt-0.5">오늘의 할 일을 추가해 주세요</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-[13px] font-semibold text-gray-700 tracking-wide">
            할 일
          </label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="할 일을 입력해주세요"
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-semibold text-gray-700 tracking-wide">공통 마감</p>
          <button
            type="button"
            onClick={() => setPickerTarget('common')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-[14px] border-[1.5px] text-left transition-all duration-200 ${
              commonDeadline ? 'border-primary bg-white' : 'border-border bg-white'
            }`}
          >
            <span className="w-9 h-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <svg
                className="w-4.5 h-4.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="13" r="8" />
                <path strokeLinecap="round" d="M12 9v4l2.5 1.5M9 3h6M5.5 6.5L4 5m14.5 1.5L20 5" />
              </svg>
            </span>
            <span className="flex-1 min-w-0">
              <span
                className={`block text-[14px] font-semibold ${commonDeadline ? 'text-ink' : 'text-muted font-light'}`}
              >
                {commonDeadline ? formatDeadlineLong(commonDeadline) : '마감을 선택해주세요'}
              </span>
              <span className="block text-[11px] text-muted mt-0.5">
                따로 안 정한 사람은 이 마감을 따라요
              </span>
            </span>
            <svg
              className="w-4 h-4 text-muted shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
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
          <p className="text-[13px] font-semibold text-gray-700 tracking-wide">
            누가 <span className="ml-1 text-[12px] font-normal text-muted">· 여러 명 가능</span>
          </p>

          {isMembersLoading ? (
            <div className="flex justify-center py-6">
              <Spinner size="sm" />
            </div>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {members.map((member) => {
                const draft = memberDrafts[member.userId]
                const isExcluded = draft?.excluded ?? false
                const isExpanded = !isExcluded && (draft?.expanded ?? false)

                if (isExpanded) {
                  return (
                    <li
                      key={member.userId}
                      className="rounded-2xl border-2 border-primary bg-primary/5 p-4 flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <MemberAvatar
                            profileImageUrl={member.profileImageUrl}
                            nickname={member.nickname}
                            size={32}
                          />
                          <span className="text-[14px] font-bold text-ink">{member.nickname}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleExpand(member.userId)}
                          className="text-[12px] font-semibold text-primary"
                        >
                          접기 ▲
                        </button>
                      </div>

                      <label className="flex flex-col gap-1.5 text-[11px] font-semibold text-gray-500">
                        맡은 부분
                        <Input
                          type="text"
                          value={draft?.customTitle ?? ''}
                          onChange={(e) => setMemberTitle(member.userId, e.target.value)}
                          placeholder={title || '이 사람이 맡을 부분을 적어주세요'}
                        />
                      </label>

                      <div className="flex flex-col gap-1.5">
                        <p className="text-[11px] font-semibold text-gray-500">마감</p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setMemberDeadlineMode(member.userId, false)}
                            className={`py-2.5 rounded-[11px] text-[13px] font-bold transition-all ${
                              !draft?.useCustomDeadline
                                ? 'bg-primary text-white'
                                : 'bg-white text-muted border border-border'
                            }`}
                          >
                            공통과 같음
                          </button>
                          <button
                            type="button"
                            onClick={() => setPickerTarget(member.userId)}
                            className={`py-2.5 rounded-[11px] text-[13px] font-bold transition-all ${
                              draft?.useCustomDeadline
                                ? 'bg-primary text-white'
                                : 'bg-white text-muted border border-border'
                            }`}
                          >
                            {draft?.useCustomDeadline && draft.customDeadline
                              ? formatDeadlineShort(draft.customDeadline)
                              : '따로 정하기'}
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                }

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
                      <div className="flex flex-col">
                        <span className="text-[14px] font-medium text-ink">{member.nickname}</span>
                        {!isExcluded && (
                          <span className="text-[11px] text-muted">
                            {draft?.useCustomDeadline && draft.customDeadline
                              ? `따로 · ${formatDeadlineShort(draft.customDeadline)}`
                              : commonDeadline
                                ? `공통 · ${formatDeadlineShort(commonDeadline)}`
                                : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleExclude(member.userId)}
                        className="text-[12px] font-semibold text-muted"
                      >
                        {isExcluded ? '제외됨' : '제외'}
                      </button>
                      {!isExcluded && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(member.userId)}
                          className="px-3 py-1.5 rounded-[10px] border border-border text-[12px] font-bold text-ink transition-all duration-200 hover:border-primary hover:text-primary"
                        >
                          + 따로
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          {!isMembersLoading && (
            <p className="text-[11px] text-muted leading-relaxed bg-gray-50 rounded-xl px-3.5 py-3">
              💡 아무도 &lsquo;따로&rsquo;를 안 펼치면 다 같이 하는 공통 업무가 돼요. 각자 완료만
              체크하면 끝.
            </p>
          )}
        </div>
      </div>

      <div className="px-6 py-5 border-t border-border flex flex-col gap-3">
        <Button onClick={handleSubmit} disabled={isLoading || isMembersLoading}>
          {isLoading ? '생성 중...' : anyExpanded ? '따로 나눠서 올리기' : '할 일 올리기'}
        </Button>
        <Button variant="secondary" onClick={() => router.back()}>
          돌아가기
        </Button>
      </div>

      <AnimatePresence>
        {pickerTarget !== null && (
          <DeadlinePicker
            value={
              pickerTarget === 'common'
                ? commonDeadline
                : (memberDrafts[pickerTarget]?.customDeadline ?? commonDeadline)
            }
            maxDate={pickerTarget === 'common' ? null : commonDeadline}
            onChange={(date) => {
              if (pickerTarget === 'common') {
                setCommonDeadline(date)
              } else {
                setMemberCustomDeadline(pickerTarget, date)
              }
            }}
            onClose={() => setPickerTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function TodoNewPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <TodoNewContent />
    </Suspense>
  )
}
