'use client'

import { motion, useReducedMotion } from 'framer-motion'

export function LoginBeeScene() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* =========================================================
          꿀벌 GIF 배경
          - 벌이 따로 날아오는 방식 X
          - GIF 자체가 로그인 화면 전체 배경
          - GIF 안에 있는 애니메이션이 그대로 재생됨
      ========================================================= */}
      <img
        src="/꿀벌.gif"
        alt=""
        className="absolute inset-0 h-full w-full object-cover select-none"
        draggable={false}
      />

      {/* =========================================================
          배경 위 가독성 보정용 오버레이
          필요 없으면 이 div를 삭제해도 됨
      ========================================================= */}
      <div className="absolute inset-0 bg-white/5" />

      {/* =========================================================
          말풍선
          GIF 위에 자연스럽게 떠 있도록 유지
      ========================================================= */}
      <motion.div
        className="absolute left-[72%] top-[20%] z-40 w-[min(62vw,240px)] -translate-x-1/2 -translate-y-1/2"
        initial={
          shouldReduceMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.5, y: 8 }
        }
        animate={
          shouldReduceMotion
            ? { opacity: 1, scale: 1, y: 0 }
            : {
                opacity: 1,
                scale: 1,
                y: [0, -5, 0],
              }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : {
                opacity: {
                  duration: 0.35,
                  delay: 0.35,
                },
                scale: {
                  type: 'spring',
                  stiffness: 260,
                  damping: 15,
                  delay: 0.35,
                },
                y: {
                  duration: 3.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.7,
                },
              }
        }
      ></motion.div>
    </div>
  )
}
