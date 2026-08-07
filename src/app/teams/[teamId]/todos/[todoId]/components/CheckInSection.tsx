'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiChevronDown, FiEdit3 } from 'react-icons/fi'
import { ApiError } from '@/lib/apiClient'
import { checkInWorkItem, getWorkItemCheckIns } from '@/services/todoService'
import type { WorkItemCheckIn } from '@/types/todo.types'

const MEMO_MAX_LENGTH = 100

function localTodayISO(): string {
  const now = new Date()
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')
}

function formatCheckDate(date: string): string {
  const [, month, day] = date.split('-')
  return `${Number(month)}/${Number(day)}`
}

interface CheckInSectionProps {
  workItemId: number
  /** 본인에게 배정된 진행 중 항목인지 (마감 판정은 내부에서) */
  isOwnInProgress: boolean
  /** WorkItem의 유효 마감 시각 (ISO) */
  deadline: string
  token: string | null
}

/**
 * 카드 하단의 진행 기록(체크인) 영역.
 * 본인 항목이면 목록을 미리 불러와 오늘 체크인 여부에 따라 입력을 보여주고,
 * 남의 항목은 토글을 열 때 지연 로드한다.
 */
export function CheckInSection({
  workItemId,
  isOwnInProgress,
  deadline,
  token,
}: CheckInSectionProps) {
  const [checkIns, setCheckIns] = useState<WorkItemCheckIn[] | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [memo, setMemo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [now] = useState(() => Date.now())
  const canCheckIn = isOwnInProgress && new Date(deadline).getTime() > now

  const loadCheckIns = useCallback(async () => {
    if (!token) return
    try {
      setCheckIns(await getWorkItemCheckIns(workItemId, token))
    } catch {
      setCheckIns([])
    }
  }, [workItemId, token])

  // 본인 항목은 오늘 체크인 여부를 알아야 입력 노출을 결정할 수 있어 미리 불러온다.
  useEffect(() => {
    if (!canCheckIn || !token) return
    let cancelled = false
    getWorkItemCheckIns(workItemId, token)
      .then((list) => {
        if (!cancelled) setCheckIns(list)
      })
      .catch(() => {
        if (!cancelled) setCheckIns([])
      })
    return () => {
      cancelled = true
    }
  }, [canCheckIn, token, workItemId])

  const todayISO = localTodayISO()
  const checkedInToday = (checkIns ?? []).some((c) => c.checkDate === todayISO)
  const count = checkIns?.length ?? 0

  async function handleSubmit() {
    const trimmed = memo.trim()
    if (!trimmed || !token || isSubmitting) return
    setIsSubmitting(true)
    setError(null)
    try {
      const created = await checkInWorkItem(workItemId, trimmed, token)
      setCheckIns((prev) => [created, ...(prev ?? [])])
      setMemo('')
      setExpanded(true)
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        // 이미 오늘 체크인함 — 목록을 다시 받아 상태를 맞춘다.
        void loadCheckIns()
      }
      setError(e instanceof ApiError ? e.message : '체크인에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function toggleExpanded() {
    setExpanded((prev) => !prev)
    if (checkIns === null) void loadCheckIns()
  }

  return (
    <div className="border-t border-border bg-gray-50/50 px-4 py-3">
      {canCheckIn &&
        (checkedInToday ? (
          <p className="mb-1 flex items-center gap-1.5 text-[12px] font-semibold text-primary">
            ✅ 오늘 체크인 완료
          </p>
        ) : (
          <div className="mb-1">
            <div className="flex items-center gap-2">
              <FiEdit3 size={13} className="shrink-0 text-gray-400" />
              <input
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                maxLength={MEMO_MAX_LENGTH}
                placeholder="오늘 한 일을 한 줄로 남겨요"
                className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!memo.trim() || isSubmitting}
                className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-white transition-opacity disabled:opacity-40"
              >
                {isSubmitting ? '기록 중...' : '오늘도 했어요'}
              </button>
            </div>
            {error && <p className="mt-1.5 text-[11px] text-status-red">{error}</p>}
          </div>
        ))}

      <button
        type="button"
        onClick={toggleExpanded}
        className="flex items-center gap-1 text-[11px] font-semibold text-muted"
      >
        진행 기록{count > 0 ? ` ${count}` : ''}
        <FiChevronDown
          size={12}
          className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            {checkIns === null ? (
              <p className="pt-2 text-[11px] text-gray-400">불러오는 중...</p>
            ) : checkIns.length === 0 ? (
              <p className="pt-2 text-[11px] text-gray-400">아직 진행 기록이 없어요</p>
            ) : (
              <ul className="flex flex-col gap-1.5 pt-2">
                {checkIns.map((checkIn) => (
                  <li key={checkIn.checkInId} className="flex items-baseline gap-2 text-[12px]">
                    <span className="shrink-0 font-mono text-[10px] text-gray-400">
                      {formatCheckDate(checkIn.checkDate)}
                    </span>
                    <span className="min-w-0 break-words text-gray-600">{checkIn.memo}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
