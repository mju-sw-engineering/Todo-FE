'use client'

import { useParams, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const WEEKDAY_SHORT = ['일', '월', '화', '수', '목', '금', '토']

function buildDateOptions() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return {
      key: `${d.getMonth() + 1}/${d.getDate()}`,
      label: WEEKDAY_SHORT[d.getDay()],
      date: `${d.getMonth() + 1}/${d.getDate()}`,
    }
  })
}

export default function AvailabilityEventNewPage() {
  const router = useRouter()
  const params = useParams()
  const teamId = Number(params.teamId)

  const dateOptions = useMemo(() => buildDateOptions(), [])

  const [title, setTitle] = useState('')
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('21:00')
  const [error, setError] = useState('')

  function toggleDate(key: string) {
    setSelectedDates((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    )
  }

  function handleSubmit() {
    if (!title.trim()) return setError('이벤트 이름을 입력해주세요')
    if (selectedDates.length === 0) return setError('가능 날짜를 하나 이상 선택해주세요')
    if (startTime >= endTime) return setError('시간 범위를 확인해주세요')
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
          <div className="flex flex-wrap gap-2">
            {dateOptions.map((opt) => {
              const selected = selectedDates.includes(opt.key)
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    toggleDate(opt.key)
                    if (error) setError('')
                  }}
                  className={`text-[13px] font-semibold px-3.5 py-2 rounded-full border transition-colors duration-150 ${
                    selected
                      ? 'bg-gray-900 border-gray-900 text-white'
                      : 'bg-white border-border text-muted hover:border-gray-400'
                  }`}
                >
                  {opt.label} {opt.date}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-gray-700 tracking-wide">시간 범위</span>
          <div className="flex items-center gap-2.5">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="flex-1 min-w-0 text-center px-3 py-3 rounded-[14px] border-[1.5px] border-border bg-white text-[14px] text-ink outline-none transition-all duration-200 focus:border-gray-900 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)]"
            />
            <span className="text-[13px] text-muted shrink-0">~</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="flex-1 min-w-0 text-center px-3 py-3 rounded-[14px] border-[1.5px] border-border bg-white text-[14px] text-ink outline-none transition-all duration-200 focus:border-gray-900 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)]"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-50 rounded-xl px-3.5 py-2.5">{error}</p>
        )}
      </div>

      <div className="px-5 py-4 border-t border-border">
        <Button size="lg" onClick={handleSubmit}>
          이벤트 만들기
        </Button>
      </div>
    </div>
  )
}
