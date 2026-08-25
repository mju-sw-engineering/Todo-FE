'use client'

import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getTeamHive } from '@/services/teamService'
import { TeamHiveIcon } from './TeamHiveIcon'
import { HiveInfoPopover } from './HiveInfoPopover'
import type { TeamHiveResponse } from '@/types/team.types'

const LEVEL_NAMES: Record<number, string> = {
  1: '새 벌집',
  2: '자라는 벌집',
  3: '튼튼한 벌집',
  4: '꿀샘 벌집',
}

function levelStorageKey(teamId: number): string {
  return `team_hive_level_${teamId}`
}

/** 직전에 본 레벨보다 오르면 축하를 띄우고, 항상 최신 레벨을 기억한다 */
function detectLevelUp(teamId: number, level: number): boolean {
  try {
    const prev = Number(localStorage.getItem(levelStorageKey(teamId)))
    localStorage.setItem(levelStorageKey(teamId), String(level))
    return prev >= 1 && level > prev
  } catch {
    return false
  }
}

interface Props {
  teamId: number
  token: string | null
  /** 캘린더처럼 위쪽 공간을 다투는 화면에서 쓰는 한 줄 버전 */
  compact?: boolean
}

/**
 * 팀 홈 할 일 리스트 위의 성장 카드.
 * 팀이 함께 모은 기록 수에 따라 벌집이 4단계로 자란다 (문턱값 0/30/100/300).
 * 조회에 실패하면(구버전 서버 등) 카드를 그리지 않아 리스트를 방해하지 않는다.
 *
 * compact여도 레벨업 감지·축하 연출은 그대로 동작한다 — 보상 순간을 잃지 않는 게 중요하다.
 */
export function TeamHiveGrowthCard({ teamId, token, compact = false }: Props) {
  const reduceMotion = useReducedMotion()
  const [hive, setHive] = useState<TeamHiveResponse | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  // 한 줄 버전은 '모은 기록 수' 같은 정보를 못 담으므로 눌러서 펼쳐 볼 수 있게 한다
  const [infoAnchor, setInfoAnchor] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (!token || Number.isNaN(teamId)) return
    let cancelled = false
    getTeamHive(teamId, token)
      .then((res) => {
        if (cancelled) return
        setHive(res)
        if (detectLevelUp(teamId, res.level)) setCelebrate(true)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [teamId, token])

  if (!hive) return null

  const { level, totalRecords, currentThreshold, nextThreshold } = hive
  const isMax = nextThreshold === null
  const remaining = isMax ? 0 : nextThreshold - totalRecords
  const progress = isMax
    ? 100
    : Math.min(
        100,
        Math.round(((totalRecords - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
      )

  return (
    <>
      {compact ? (
        <button
          type="button"
          aria-label="벌집 성장 단계 설명 보기"
          onClick={(e) => setInfoAnchor(e.currentTarget.getBoundingClientRect())}
          className="mx-5 mt-3 flex items-center gap-3 rounded-[16px] border border-sun/50 bg-gradient-to-br from-point-light to-sun-glow px-3.5 py-2.5 shadow-[0_3px_12px_-5px_rgba(237,160,32,0.5)] transition-all hover:brightness-[1.03] active:scale-[0.99]"
        >
          <span className="shrink-0 drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">
            <TeamHiveIcon level={level} size={32} />
          </span>
          <span className="shrink-0 text-[12.5px] font-black text-ink">우리 벌집 Lv.{level}</span>
          <div className="flex-1 h-2 rounded-full bg-white/55 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-point"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <span className="shrink-0 text-[10.5px] font-bold text-neutral-90">
            {isMax ? '최고 단계' : `${remaining}개 남음`}
          </span>
          <svg
            className="shrink-0 w-3.5 h-3.5 text-neutral-70"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <circle cx="8" cy="8" r="6.4" />
            <path strokeLinecap="round" d="M8 7.2v3.6" />
            <circle cx="8" cy="5.1" r="0.7" fill="currentColor" stroke="none" />
          </svg>
        </button>
      ) : (
        <div className="mx-5 mt-3 flex items-center gap-3 rounded-[16px] border border-border bg-white px-3.5 py-2.5">
          <div className="shrink-0">
            <TeamHiveIcon level={level} size={46} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[13px] font-black text-ink truncate">우리 벌집 Lv.{level}</span>
              <span className="shrink-0 text-[10.5px] font-semibold text-muted">
                {isMax ? (
                  '최고 단계'
                ) : (
                  <>
                    다음 단계까지 <b className="font-black text-ink">{remaining}개</b>
                  </>
                )}
              </span>
            </div>
            <p className="text-[10.5px] text-muted mt-0.5">함께 모은 기록 {totalRecords}개</p>
            <div className="mt-1.5 h-1.5 rounded-full bg-neutral-30 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {infoAnchor && (
          <HiveInfoPopover
            level={level}
            totalRecords={totalRecords}
            nextThreshold={nextThreshold}
            anchor={infoAnchor}
            onClose={() => setInfoAnchor(null)}
          />
        )}
      </AnimatePresence>

      {/* hive가 있어야 여기까지 렌더되므로 (클라이언트 fetch 이후) SSR에서 portal이 실행될 일은 없다.
          포털 안 AnimatePresence는 exit이 끝나지 않는 문제가 있어 조건부 렌더로 즉시 닫는다. */}
      {celebrate &&
        createPortal(
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setCelebrate(false)}
          >
            <motion.div
              className="w-full max-w-xs rounded-[24px] bg-white border border-border px-6 pt-8 pb-6 text-center"
              initial={{ scale: 0.7, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              transition={
                reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 22 }
              }
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="flex justify-center"
                initial={{ scale: 0.5 }}
                animate={{ scale: reduceMotion ? 1 : [0.5, 1.15, 1] }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.6, times: [0, 0.7, 1] }}
              >
                <TeamHiveIcon level={level} size={96} />
              </motion.div>
              <p className="mt-4 text-[17px] font-black text-ink">우리 벌집이 자랐어요!</p>
              <p className="mt-1 text-[13px] font-bold text-primary">
                Lv.{level} {LEVEL_NAMES[level]}
              </p>
              <button
                onClick={() => setCelebrate(false)}
                className="mt-5 w-full rounded-[14px] bg-primary py-3 text-[14px] font-bold text-white active:scale-[0.98] transition-transform"
              >
                좋아요!
              </button>
            </motion.div>
          </motion.div>,
          document.body
        )}
    </>
  )
}
