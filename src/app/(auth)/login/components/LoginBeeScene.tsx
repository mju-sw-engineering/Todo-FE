'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

/**
 * 인사말을 바꿀 시각(초). 영상을 12fps로 뜯어 입 안 붉은 영역의 넓이를 프레임마다 재보니
 * 입이 열려 있는 구간은 0~2.8초 · 5.9~8.3초 · 8.6~10초였다. 그 안에서 간격이 고르게
 * 나오도록 골랐다 — 한쪽에 몰리면 말풍선이 잠깐 떴다 오래 비어 어색해진다.
 * 영상(10.08초 loop)을 교체하면 이 값도 다시 재야 한다.
 */
const GREETING_CUES = [0.6, 3.9, 6.5]

const GREETINGS = ['오늘도 화이팅!', '할 일 하러 왔구나', '같이 해볼까?']

/**
 * 로그인 화면 전체 배경 — 꿀벌 캐릭터 영상 + 인사말 말풍선.
 *
 * - webm(VP9) 우선, iOS/Safari는 mp4(H.264)로 폴백한다.
 * - 자동재생 조건상 muted + playsInline은 필수다. (Capacitor WebView 포함)
 * - 화면이 짧아 세로로 크롭될 때 얼굴이 먼저 잘리지 않도록 크롭 기준을 위쪽(30%)에 둔다.
 */
export function LoginBeeScene() {
  const shouldReduceMotion = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [greetingIndex, setGreetingIndex] = useState(-1)

  // 모션 최소화 설정이면 첫 프레임에서 정지시켜 정지 이미지처럼 보이게 한다
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (shouldReduceMotion) {
      video.pause()
      video.currentTime = 0
    } else {
      void video.play().catch(() => {})
    }
  }, [shouldReduceMotion])

  // 재생 위치가 큐를 지날 때마다 다음 인사말로 넘긴다.
  // 한 바퀴 돌아 0초로 되돌아가면 -1이 되어 말풍선이 사라진다.
  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video) return

    let next = -1
    for (let i = 0; i < GREETING_CUES.length; i += 1) {
      if (video.currentTime >= GREETING_CUES[i]) next = i
    }
    setGreetingIndex((prev) => (prev === next ? prev : next))
  }

  // 모션 최소화 설정에서는 영상이 멈춰 큐가 오지 않으므로 첫 인사말을 그냥 띄운다
  const visibleIndex = shouldReduceMotion ? 0 : greetingIndex

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <video
        ref={videoRef}
        poster="/videos/bee-login-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover object-[50%_30%] select-none"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
      >
        <source src="/videos/bee-login.webm" type="video/webm" />
        <source src="/videos/bee-login.mp4" type="video/mp4" />
      </video>

      {/* 배경 위 가독성 보정용 오버레이 */}
      <div className="absolute inset-0 bg-static-white/5" />

      {/* 하단 스크림 — 화면이 짧은 기기에서 타이틀이 캐릭터와 겹칠 때 대비를 확보한다 */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-static-black/25 to-transparent" />

      {/* 인사말 말풍선 — 벌 머리 오른쪽 빈 하늘에 뜬다.
          위치를 안전영역 기준으로 잡아, 웹에서는 화면 위쪽에 붙고
          노치가 있는 기기에서는 상태바 아래로 자동으로 내려온다. */}
      <div className="absolute right-4 top-[calc(env(safe-area-inset-top)+16px)] z-20 w-[min(34vw,124px)]">
        <AnimatePresence mode="wait">
          {visibleIndex >= 0 && (
            <motion.div
              key={visibleIndex}
              initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.85 }}
              /* 등장·퇴장은 반드시 끝나는 transition만 쓴다. 여기에 repeat: Infinity를 걸면
                 AnimatePresence(mode="wait")가 exit 완료를 영영 기다려 다음 말풍선이 못 들어온다. */
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      opacity: { duration: 0.25 },
                      scale: { type: 'spring', stiffness: 260, damping: 15 },
                    }
              }
            >
              {/* 둥실 떠 있는 움직임은 안쪽에서 따로 돌린다 */}
              <motion.div
                className="relative rounded-[14px] bg-static-white/95 px-3 py-1.5 text-center shadow-[0_3px_12px_rgba(0,0,0,0.12)]"
                animate={shouldReduceMotion ? { y: 0 } : { y: [0, -5, 0] }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
                }
              >
                <span className="font-jua text-[13px] leading-tight text-ink">
                  {GREETINGS[visibleIndex]}
                </span>
                {/* 꼬리 — 벌 쪽(왼쪽 아래)을 가리킨다 */}
                <span className="absolute -bottom-1 left-4 h-2.5 w-2.5 rotate-45 rounded-[2px] bg-static-white/95" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
