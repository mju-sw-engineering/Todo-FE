'use client'

import { AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { useAuth } from '@/store/authStore'
import { createAvailabilityPoll } from '@/services/availabilityService'
import { AvailabilityCalendarSheet } from './components/AvailabilityCalendarSheet'
import { RangeTimeSheet } from './components/RangeTimeSheet'

const WEEKDAY_SHORT = ['일', '월', '화', '수', '목', '금', '토']

function formatDateChip(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number)
  const dow = new Date(dateStr).getDay()
  return `${WEEKDAY_SHORT[dow]} ${m}/${d}`
}

function formatHourLabel(hour: number): string {
  if (hour === 24) return '자정(24시)'
  const label = hour < 12 ? '오전' : '오후'
  const hour12 = hour % 12 || 12
  return `${label} ${hour12}:00`
}

export default function AvailabilityEventNewPage() {
  const router = useRouter()
  const params = useParams()
  const teamId = Number(params.teamId)
  const { token } = useAuth()

  const [title, setTitle] = useState('')
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [startHour, setStartHour] = useState(9)
  const [endHour, setEndHour] = useState(21)
  const { isLoading, error, setError, run } = useAsyncTask()

  const [showCalendarSheet, setShowCalendarSheet] = useState(false)
  const [showStartTimeSheet, setShowStartTimeSheet] = useState(false)
  const [showEndTimeSheet, setShowEndTimeSheet] = useState(false)

  async function handleSubmit() {
    if (!title.trim()) return setError('이벤트 이름을 입력해주세요')
    if (selectedDates.length === 0) return setError('가능 날짜를 하나 이상 선택해주세요')
    if (startHour >= endHour) return setError('시간 범위를 확인해주세요')
    if (!token) return setError('로그인이 필요합니다.')

    try {
      await run(
        () =>
          createAvailabilityPoll(
            teamId,
            {
              title: title.trim(),
              dateOptions: selectedDates,
              startHour,
              endHour,
            },
            token
          ),
        { fallback: '투표 생성 중 오류가 발생했습니다.', rethrow: true }
      )
    } catch {
      return
    }

    router.push(`/teams/${teamId}/availability?created=1`)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-fade-up">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <BackButton onClick={() => router.back()} />
          <div className="min-w-0">
            <h1 className="text-[20px] font-black text-ink leading-tight">
              가능 시간 이벤트 만들기
            </h1>
            <p className="text-[12px] text-muted mt-0.5">팀원 누구나 만들 수 있어요</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 pb-4 flex flex-col gap-6">
        <Input
          id="eventTitle"
          label="이벤트 이름"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (error) setError('')
          }}
          placeholder="예: 이번주 팀 회의"
        />

        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-gray-700 tracking-wide">
            가능 날짜 선택
          </span>
          <button
            type="button"
            onClick={() => {
              setShowCalendarSheet(true)
              if (error) setError('')
            }}
            className={`w-full px-4 py-3.25 rounded-[14px] border-[1.5px] text-[14px] text-left transition-all duration-200 ${selectedDates.length > 0 ? 'border-primary bg-white text-ink font-medium' : 'border-border bg-white text-muted font-light'}`}
          >
            <div className="flex items-center justify-between">
              <span>
                {selectedDates.length > 0
                  ? `${selectedDates.length}일 선택됨`
                  : '캘린더에서 날짜를 선택해주세요'}
              </span>
              <svg
                className="w-4 h-4 text-muted shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <rect x="3.5" y="4.5" width="17" height="16" rx="3" />
                <path strokeLinecap="round" d="M8 2.5v4M16 2.5v4M3.5 9.5h17" />
              </svg>
            </div>
          </button>

          {selectedDates.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {selectedDates.map((d) => (
                <span
                  key={d}
                  className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary"
                >
                  {formatDateChip(d)}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-gray-700 tracking-wide">시간 범위</span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setShowStartTimeSheet(true)
                if (error) setError('')
              }}
              className="flex-1 min-w-0 text-center px-3 py-3 rounded-[14px] border-[1.5px] border-border bg-white text-[14px] text-ink transition-all duration-200 hover:border-primary"
            >
              {formatHourLabel(startHour)}
            </button>
            <span className="text-[13px] text-muted shrink-0">~</span>
            <button
              type="button"
              onClick={() => {
                setShowEndTimeSheet(true)
                if (error) setError('')
              }}
              className="flex-1 min-w-0 text-center px-3 py-3 rounded-[14px] border-[1.5px] border-border bg-white text-[14px] text-ink transition-all duration-200 hover:border-primary"
            >
              {formatHourLabel(endHour)}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-status-red bg-status-red/10 rounded-xl px-3.5 py-2.5">
            {error}
          </p>
        )}
      </div>

      <div className="px-5 py-4 border-t border-border">
        <Button size="lg" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? '만드는 중...' : '이벤트 만들기'}
        </Button>
      </div>

      <AnimatePresence>
        {showCalendarSheet && (
          <AvailabilityCalendarSheet
            selectedDates={selectedDates}
            onConfirm={setSelectedDates}
            onClose={() => setShowCalendarSheet(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStartTimeSheet && (
          <RangeTimeSheet
            title="시작 시간 선택"
            value={startHour}
            onChange={setStartHour}
            onClose={() => setShowStartTimeSheet(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEndTimeSheet && (
          <RangeTimeSheet
            title="종료 시간 선택"
            value={endHour}
            onChange={setEndHour}
            onClose={() => setShowEndTimeSheet(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
