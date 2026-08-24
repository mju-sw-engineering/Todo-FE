'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const HINT_KEY = 'team_menu_hint_seen'
/** 화면이 자리를 잡은 뒤에 떠야 눈에 걸린다 */
const SHOW_DELAY_MS = 700
const VISIBLE_MS = 4500

export function markTeamMenuHintSeen(): void {
  try {
    localStorage.setItem(HINT_KEY, '1')
  } catch {
    // 시크릿 모드 등 저장이 막힌 환경 — 힌트를 한 번 더 보는 정도는 감수한다
  }
}

function alreadySeen(): boolean {
  try {
    return localStorage.getItem(HINT_KEY) === '1'
  } catch {
    return true
  }
}

interface TeamMenuHintProps {
  /** 메뉴가 열렸거나 하는 이유로 힌트를 감춰야 할 때 */
  suppressed: boolean
}

/**
 * ⋯ 버튼 아래에 잠깐 떴다 사라지는 안내.
 * 채팅·시간 투표가 헤더에서 메뉴 안으로 들어가면서 눈에 안 띄게 돼 한 번만 알려준다.
 * 한 번 보고 나면 localStorage에 남겨 다시 띄우지 않는다.
 */
export function TeamMenuHint({ suppressed }: TeamMenuHintProps) {
  const [visible, setVisible] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (alreadySeen()) return
    const show = setTimeout(() => setVisible(true), SHOW_DELAY_MS)
    const hide = setTimeout(() => {
      setVisible(false)
      markTeamMenuHintSeen()
    }, SHOW_DELAY_MS + VISIBLE_MS)
    return () => {
      clearTimeout(show)
      clearTimeout(hide)
    }
  }, [])

  if (!visible || suppressed) return null

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      // 버튼 위에 겹쳐도 탭을 가로채면 안 된다
      className="absolute top-full right-0 mt-1.5 z-30 pointer-events-none"
      role="status"
    >
      <span className="absolute -top-1 right-3.5 w-2.5 h-2.5 rotate-45 rounded-[2px] bg-ink" />
      <span className="relative block whitespace-nowrap rounded-[12px] bg-ink px-3 py-2 text-[12px] font-bold text-white shadow-[0_6px_18px_rgba(23,27,38,0.22)]">
        팀 채팅과 시간 투표는 여기 있어요
      </span>
    </motion.div>
  )
}
