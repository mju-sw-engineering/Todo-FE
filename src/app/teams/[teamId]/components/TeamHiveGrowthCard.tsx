'use client'

import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getTeamHive } from '@/services/teamService'
import { TeamHiveIcon } from './TeamHiveIcon'
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
}

/**
 * 팀 홈 할 일 리스트 위의 콤팩트 성장 카드.
 * 팀이 함께 모은 기록 수에 따라 벌집이 4단계로 자란다 (문턱값 0/30/100/300).
 * 조회에 실패하면(구버전 서버 등) 카드를 그리지 않아 리스트를 방해하지 않는다.
 */
export function TeamHiveGrowthCard({ teamId, token }: Props) {
  const [hive, setHive] = useState<TeamHiveResponse | null>(null)
  const [celebrate, setCelebrate] = useState(false)

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
      <div className="mx-5 mt-3 flex items-center gap-3 rounded-[16px] border border-[#f1e6cd] bg-[#fdf6e6] px-3.5 py-2.5">
        <div className="shrink-0">
          <TeamHiveIcon level={level} size={46} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[13px] font-black text-ink truncate">우리 벌집 Lv.{level}</span>
            <span className="shrink-0 text-[10.5px] font-semibold text-[#a08c60]">
              {isMax ? (
                '최고 단계'
              ) : (
                <>
                  다음 단계까지 <b className="font-black text-[#92600f]">{remaining}개</b>
                </>
              )}
            </span>
          </div>
          <p className="text-[10.5px] text-[#a08c60] mt-0.5">함께 모은 기록 {totalRecords}개</p>
          <div className="mt-1.5 h-1.5 rounded-full bg-[#f3ecd9] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ffcf5e] to-[#f39d17] transition-[width] duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

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
              className="w-full max-w-xs rounded-[24px] bg-[#fdf6e6] border border-[#f1e6cd] px-6 pt-8 pb-6 text-center"
              initial={{ scale: 0.7, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="flex justify-center"
                initial={{ scale: 0.5 }}
                animate={{ scale: [0.5, 1.15, 1] }}
                transition={{ duration: 0.6, times: [0, 0.7, 1] }}
              >
                <TeamHiveIcon level={level} size={96} />
              </motion.div>
              <p className="mt-4 text-[17px] font-black text-ink">우리 벌집이 자랐어요!</p>
              <p className="mt-1 text-[13px] font-bold text-[#92600f]">
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
