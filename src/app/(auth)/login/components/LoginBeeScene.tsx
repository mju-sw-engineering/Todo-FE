'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useIsNativeApp } from '@/hooks/useIsNativeApp'

/**
 * 인사말을 바꿀 시각(초). 영상을 12fps로 뜯어 입 안 붉은 영역의 넓이를 프레임마다 재보니
 * 입이 열려 있는 구간은 0~2.8초 · 5.9~8.3초 · 8.6~10초였다. 그 안에서 간격이 고르게
 * 나오도록 골랐다 — 한쪽에 몰리면 말풍선이 잠깐 떴다 오래 비어 어색해진다.
 * 영상(10.08초 loop)을 교체하면 이 값도 다시 재야 한다.
 */
const GREETING_CUES = [0.6, 3.9, 6.5]

/** 인사말이 뜨는 자리 — 화면 가운데를 기준으로 좌우로 흩어지게 잡는다 (%, 자기 중심 기준) */
const GREETINGS = [
  { text: '오늘도 화이팅!', top: '20%', left: '20%', accent: false },
  { text: '어서 와, 반가워!', top: '38%', left: '80%', accent: true },
  { text: '같이 해볼까?', top: '64%', left: '20%', accent: false },
] as const

/**
 * 로그인 화면 전체 배경 — 꿀벌 캐릭터 영상 + 인사말 말풍선.
 *
 * - webm(VP9) 우선, iOS/Safari는 mp4(H.264)로 폴백한다.
 * - 자동재생 조건상 muted + playsInline은 필수다. (Capacitor WebView 포함)
 * - 크롭 기준은 정중앙(object-center)이다. 원본 1112×1856을 폭 402pt에 맞추면 세로 671pt가
 *   되고 벌은 그 한가운데 369pt를 차지한다. 아이디 폼을 펼쳐 히어로가 약 390pt로 줄어도
 *   중앙 기준이면 창이 벌 구간(152~521pt)에 그대로 얹혀 발끝까지 살아남는다.
 *   기준을 위로 올리면 창이 하늘 쪽으로 끌려가 그만큼 다리가 아래로 잘려나가므로 올리지 않는다.
 *   히어로가 최소치(min-h-64=256pt)까지 눌려도 얼굴(213~347pt)은 창 안에 남는다.
 */
export function LoginBeeScene() {
  const shouldReduceMotion = useReducedMotion()
  const isNativeApp = useIsNativeApp()
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
  const greeting = visibleIndex >= 0 ? GREETINGS[visibleIndex] : null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <video
        ref={videoRef}
        poster="/videos/bee-login-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover object-center select-none"
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

      {/* 상단 스크림 — iOS WebView에서 <video>가 안전영역 경계(57pt)에 만드는 합성 이음새를
          가리고 상태바 가독성을 확보한다. 웹에는 가릴 이음새가 없으므로 네이티브에서만 그린다. */}
      {isNativeApp && (
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-static-white/45 to-transparent" />
      )}

      {/* 하단 스크림 — 화면이 짧은 기기에서 타이틀이 캐릭터와 겹칠 때 대비를 확보한다 */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-static-black/25 to-transparent" />

      {/* 인사말 말풍선 — 캐릭터 곁 서로 다른 자리에서 반투명하게 하나씩 떠올랐다가
          위로 흐르듯 사라진다. 다음 말풍선은 이전 것이 완전히 사라진 뒤에만 나타난다
          (AnimatePresence exit을 기다리지 않으면 위치가 겹쳐 보인다). */}
      <AnimatePresence mode="wait">
        {greeting && (
          <motion.div
            key={visibleIndex}
            className={`absolute z-20 whitespace-nowrap rounded-[32px] px-5 py-3 shadow-[0_6px_20px_rgba(0,0,0,0.12)] backdrop-blur-md ${
              greeting.accent ? 'bg-point/55' : 'bg-static-white/45'
            }`}
            style={{ top: greeting.top, left: greeting.left }}
            initial={
              shouldReduceMotion
                ? { opacity: 1, x: '-50%', y: 0, scale: 1 }
                : { opacity: 0, x: '-50%', y: 18, scale: 0.9 }
            }
            animate={{ opacity: 1, x: '-50%', y: 0, scale: 1 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0, x: '-50%' }
                : { opacity: 0, x: '-50%', y: -16, scale: 0.95 }
            }
            transition={
              shouldReduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
            }
          >
            <span className="text-[16px] font-semibold leading-none text-ink">{greeting.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
