'use client'

import { motion, useReducedMotion, type AnimationDefinition, type Variants } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { LOGIN_BEE_SVG } from './loginBeeSvg'

// ─── 로그인 벌 씬 수정 가이드 ───────────────────────────────────────────────
// 벌은 한 장의 리그형 SVG로 렌더하고 날개·팔·눈·입 파츠만 움직인다.
// 몸통이 프레임 간에 공유되므로 표정이 바뀌어도 잔상·점프가 없다.
// 핵심 콘셉트: 벌은 제자리 호버링, "날아가는 느낌"은 배경(언덕·구름·스피드라인)이 만든다.
//
// 무엇을 고치려면 어디를:
// - 시퀀스 타이밍·궤적(비행 3s→놀람→깜빡→인사): 아래 BEE_VARIANTS + handleBeeAnimationComplete
// - 벌 크기·화면 위치: 맨 아래 벌 컨테이너 div 의 w-[min(60vw,235px)] / top-[43%]
// - 배경 속도·이동량: 언덕·구름·스피드라인 각 motion.div 의 animate 값 (isFlying 분기)
// - 날개짓·다리 스윙·팔 흔들기·표정 파츠 전환: globals.css 의 .login-bee 섹션
// - 캐릭터 모양 자체: public/images/bee/login/login-bee-character.svg 수정 후
//   `node scripts/generate-login-bee-svg.mjs` 로 loginBeeSvg.ts 재생성 (SVG 상단 주석 참고)
// ───────────────────────────────────────────────────────────────────────────
type BeePhase = 'flying' | 'surprised' | 'waving'

// 배경(언덕·구름)과 같은 오른쪽→왼쪽으로 흘러야 벌이 오른쪽으로 나는 것처럼 보인다
const SPEED_LINES = [
  { className: 'right-[-18%] top-[18%] w-20', delay: 0 },
  { className: 'right-[-32%] top-[31%] w-12', delay: 0.24 },
  { className: 'right-[-12%] top-[47%] w-28', delay: 0.48 },
  { className: 'right-[-26%] top-[64%] w-16', delay: 0.12 },
  { className: 'right-[-20%] top-[78%] w-10', delay: 0.66 },
] as const

// 잔디 한 묶음 = 곡선 풀잎 3장 (아래 GRASS_BLADES 경로). flip으로 좌우 변화를 준다
const GRASS_TUFTS = [
  { className: 'left-[3%] h-4 w-6', flip: false },
  { className: 'left-[11%] h-5 w-8', flip: true },
  { className: 'left-[19%] h-3.5 w-5', flip: false },
  { className: 'left-[28%] h-5 w-8', flip: false },
  { className: 'left-[37%] h-4 w-6', flip: true },
  { className: 'left-[51%] h-5 w-8', flip: false },
  { className: 'left-[62%] h-3.5 w-5', flip: true },
  { className: 'left-[73%] h-5 w-8', flip: false },
  { className: 'left-[83%] h-4 w-6', flip: true },
  { className: 'left-[92%] h-5 w-8', flip: false },
] as const

const GRASS_BLADES = [
  'M3 18 C4 12 2 7 0.5 4 C5 8 7 13 7.5 18 Z',
  'M11 18 C12 10 12 5 10.5 0 C15 6 15.5 12 15 18 Z',
  'M20 18 C22 13 25 9 27.5 7 C24.5 12 23 15 22.5 18 Z',
] as const

// keyframe 배열의 첫 값은 반드시 직전 상태의 끝 값과 일치시켜 전환 시 점프를 없앤다
const BEE_VARIANTS: Variants = {
  // 비행감은 배경 패럴랙스가 전담한다 — 벌은 화면 밖에서 들어오지 않고
  // 제자리에서 앞으로 살짝 기운 채 호버링만 하다가 착지하며 자세를 세운다
  flying: {
    x: 0,
    y: [0, -7, 2, -5, 0],
    rotate: [-3, -1.5, -3, 0],
    scale: 1,
    opacity: 1,
    transition: { duration: 3, ease: 'easeInOut' },
  },
  surprised: {
    x: [0, 5, -1, 0],
    y: [0, 2, 0],
    rotate: [0, 1.5, -0.3, 0],
    scale: [1, 1.035, 1],
    opacity: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
  waving: {
    x: 0,
    y: [0, -3, -1, -3, 0],
    rotate: [0, 0.7, 0, -0.7, 0],
    scale: 1,
    opacity: 1,
    transition: { duration: 4.4, repeat: Infinity, ease: 'easeInOut' },
  },
}

export function LoginBeeScene() {
  const shouldReduceMotion = useReducedMotion()
  const [phase, setPhase] = useState<BeePhase>('flying')
  const [eyesClosed, setEyesClosed] = useState(false)
  const timersRef = useRef<number[]>([])

  useEffect(() => {
    const timers = timersRef.current
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [])

  // 인사 단계에 들어가면 3~5.5초 간격으로 랜덤 깜빡여 살아있는 느낌을 준다
  useEffect(() => {
    if (shouldReduceMotion || phase !== 'waving') {
      return
    }
    let blinkTimer: number | undefined
    let openTimer: number | undefined
    const schedule = () => {
      blinkTimer = window.setTimeout(
        () => {
          setEyesClosed(true)
          openTimer = window.setTimeout(() => {
            setEyesClosed(false)
            schedule()
          }, 140)
        },
        3000 + Math.random() * 2500
      )
    }
    schedule()
    return () => {
      window.clearTimeout(blinkTimer)
      window.clearTimeout(openTimer)
    }
  }, [phase, shouldReduceMotion])

  // 타이머 대신 애니메이션 완료 시점에 다음 단계로 넘어가 로딩 지연에도 어긋나지 않는다
  function handleBeeAnimationComplete(definition: AnimationDefinition) {
    if (shouldReduceMotion) {
      return
    }
    if (definition === 'flying') {
      setPhase('surprised')
      return
    }
    if (definition === 'surprised') {
      // 놀란 입 → 웃는 입 교체를 눈 감은 140ms 사이에 숨긴다
      setEyesClosed(true)
      timersRef.current.push(
        window.setTimeout(() => setPhase('waving'), 140),
        window.setTimeout(() => setEyesClosed(false), 240)
      )
    }
  }

  // 인사 중에 벌을 탭하면 깜짝 놀랐다가 기존 체인(놀람→깜빡→인사)을 타고 돌아온다
  function handleBeeTap() {
    if (shouldReduceMotion || phase !== 'waving') {
      return
    }
    setPhase('surprised')
  }

  const visiblePhase: BeePhase = shouldReduceMotion ? 'waving' : phase
  const isFlying = visiblePhase === 'flying'
  const beeClassName = ['login-bee', `is-${visiblePhase}`, eyesClosed ? 'is-eyes-closed' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* 해는 배경 패럴랙스와 대비되도록 고정해 둔다 */}
      <div className="absolute left-[-10%] top-[4%] h-44 w-44 rounded-full bg-sun-glow/45 opacity-60 blur-2xl" />
      <div className="absolute left-[8%] top-[11%] h-24 w-24 rounded-full bg-sun/80 shadow-[0_0_48px_var(--color-sun-glow)]" />

      {/* 원경의 작은 뭉게구름 — 위 봉우리 + 아래 몸통 2겹, 아주 느리게 흘러 깊이를 만든다 */}
      <motion.div
        className="absolute right-[9%] top-[6%]"
        animate={shouldReduceMotion ? undefined : { x: [0, -14, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="ml-4 h-3 w-9 rounded-full bg-static-white/55 blur-[2px]" />
        <div className="-mt-1.5 h-4 w-16 rounded-full bg-static-white/55 blur-[2px]" />
      </motion.div>
      <motion.div
        className="absolute right-[30%] top-[12%]"
        animate={shouldReduceMotion ? undefined : { x: [0, 10, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="ml-3 h-2.5 w-6 rounded-full bg-static-white/45 blur-[2px]" />
        <div className="-mt-1 h-3 w-11 rounded-full bg-static-white/45 blur-[2px]" />
      </motion.div>

      {/* 굽이치는 초원 능선 2겹 — 뒤(밝음)와 앞(어두움)이 다른 속도로 흘러 깊이를 만든다 */}
      <motion.div
        className="absolute bottom-0 left-[-18%] h-28 w-[140%] transform-gpu will-change-transform"
        initial={{ x: 0 }}
        animate={{ x: isFlying ? -44 : -52 }}
        transition={
          isFlying ? { duration: 3, ease: 'linear' } : { duration: 0.75, ease: [0.16, 1, 0.3, 1] }
        }
      >
        <svg viewBox="0 0 600 100" preserveAspectRatio="none" className="h-full w-full">
          <path
            d="M0 100 L0 58 Q80 26 170 40 Q260 54 350 32 Q460 8 600 36 L600 100 Z"
            className="fill-meadow/55"
          />
        </svg>
      </motion.div>
      <motion.div
        className="absolute bottom-0 left-[-20%] h-[76px] w-[145%] transform-gpu will-change-transform"
        initial={{ x: 0 }}
        animate={{ x: isFlying ? -72 : -84 }}
        transition={
          isFlying ? { duration: 3, ease: 'linear' } : { duration: 0.75, ease: [0.16, 1, 0.3, 1] }
        }
      >
        <svg viewBox="0 0 600 76" preserveAspectRatio="none" className="h-full w-full">
          <path
            d="M0 76 L0 44 Q110 62 230 48 Q350 32 460 50 Q535 60 600 46 L600 76 Z"
            className="fill-meadow-dark/38"
          />
        </svg>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 h-12 opacity-60">
        {GRASS_TUFTS.map((tuft) => (
          <svg
            key={tuft.className}
            viewBox="0 0 28 18"
            className={[
              'absolute bottom-0 fill-meadow-dark',
              tuft.className,
              tuft.flip ? 'scale-x-[-1]' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {GRASS_BLADES.map((d) => (
              <path key={d} d={d} />
            ))}
          </svg>
        ))}
      </div>

      <motion.div
        className="absolute left-[88%] top-[16%] h-24 w-52 rounded-full bg-static-white/55 blur-2xl transform-gpu will-change-transform"
        initial={{ x: 0, opacity: 0.2 }}
        animate={{ x: isFlying ? -330 : -380, opacity: isFlying ? 0.5 : 0.28 }}
        transition={
          isFlying ? { duration: 3, ease: 'linear' } : { duration: 0.75, ease: [0.16, 1, 0.3, 1] }
        }
      />

      {SPEED_LINES.map((line) => (
        <motion.span
          key={`${line.className}-${line.delay}`}
          className={`absolute h-1 rounded-full bg-primary/25 transform-gpu will-change-transform ${line.className}`}
          initial={{ x: 80, opacity: 0 }}
          animate={
            isFlying ? { x: [80, -520], opacity: [0, 0.58, 0.5, 0] } : { x: -560, opacity: 0 }
          }
          transition={
            isFlying
              ? {
                  duration: 0.95,
                  delay: line.delay,
                  repeat: Infinity,
                  ease: 'linear',
                }
              : { duration: 0.58, ease: [0.16, 1, 0.3, 1] }
          }
        />
      ))}

      {/* 벌 그림자 — 착지 후 벌 바로 아래에 나타나 둥실거림(waving y 궤적)에 맞춰 크기가 숨쉰다 */}
      <div className="absolute left-1/2 top-[70%] w-24 -translate-x-1/2">
        <motion.div
          className="h-3.5 rounded-[50%] bg-static-black/30 blur-md"
          initial={{ opacity: 0, scale: 0.55 }}
          animate={
            shouldReduceMotion
              ? { opacity: 0.35, scale: 1 }
              : isFlying
                ? { opacity: 0, scale: 0.55 }
                : { opacity: 0.35, scale: [1, 0.9, 0.96, 0.9, 1] }
          }
          transition={
            isFlying
              ? { duration: 0.3 }
              : {
                  opacity: { duration: 0.5, ease: 'easeOut' },
                  scale: { duration: 4.4, repeat: Infinity, ease: 'easeInOut' },
                }
          }
        />
      </div>

      <div className="absolute left-1/2 top-[43%] z-10 w-[min(48vw,180px)] -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="pointer-events-auto relative transform-gpu cursor-pointer will-change-transform"
          initial={shouldReduceMotion ? false : { x: 0, y: 0, rotate: -3, scale: 1, opacity: 1 }}
          animate={shouldReduceMotion ? undefined : visiblePhase}
          variants={BEE_VARIANTS}
          onAnimationComplete={handleBeeAnimationComplete}
          onClick={handleBeeTap}
        >
          {visiblePhase === 'surprised' && (
            <span className="animate-emoji-pop absolute -top-3 left-[64%] z-10 rotate-6 font-jua text-3xl text-ink select-none">
              !
            </span>
          )}
          <div className={beeClassName} dangerouslySetInnerHTML={{ __html: LOGIN_BEE_SVG }} />
        </motion.div>
      </div>
    </div>
  )
}
