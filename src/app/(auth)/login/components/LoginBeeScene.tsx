'use client'

import { motion, useReducedMotion, type AnimationDefinition, type Variants } from 'framer-motion'
import { useEffect, useState, type CSSProperties } from 'react'
import { LOGIN_BEE_SVG } from './loginBeeSvg'

// ─── 로그인 벌 씬 (단독 비행) 수정 가이드 ──────────────────────────────────
// 서사: 혼자 날아온 벌이 잠깐 순항하다 퇴장하고, 다시 처음부터 등장한다.
// 순항 포즈(24° 기울기 + 처진 파츠)는 globals.css의 .login-bee.is-cruise 가 담당.
//
// 무엇을 고치려면 어디를:
// - 사이클 타이밍(등장 1.6s → 합류 → 순항 → 8.6s 퇴장 → 10s 재시작): LoginBeeScene 의 run() 타이머
// - 위치·크기: 아래 <LoginBee className> 의 left/top/w 값
// - 진입 궤적·통통 튀는 정도: LoginBee 의 enter variant (spring stiffness/damping)
// - 둥실거림 주기·깊이: <LoginBee bobDuration/bobDepth>
// - 날개짓 속도: <LoginBee flapDuration>
// - 순항 포즈·표정 파츠: globals.css .login-bee 섹션
// - 캐릭터 모양: public/images/bee/login-bee-character.svg 수정 후
//   `node scripts/generate-login-bee-svg.mjs` (SVG 상단 주석 참고)
// ───────────────────────────────────────────────────────────────────────────
type ScenePhase = 'solo' | 'joining' | 'cruise' | 'depart'

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

const CRUISE_TILT = 24

interface LoginBeeProps {
  /* 위치·크기·z-index 를 담당하는 래퍼 클래스 */
  className: string
  accessory?: 'ribbon' | 'sprout'
  /* 날개짓 주기 (작은 벌일수록 빠르게) */
  flapDuration: string
  /* 둥실거림 주기·깊이 — 셋이 서로 달라야 복제처럼 안 보인다 */
  bobDuration: number
  bobDepth: number
  /* 합류 진입 시작 오프셋과 지연 (리더 포함 — 사이클마다 재진입) */
  enterFrom?: { x: number; y: number }
  enterDelay?: number
  /* 퇴장 시차 — 리더가 먼저, 동료들이 따라 나간다 */
  departDelay?: number
  departing: boolean
  visible: boolean
  reduce: boolean
}

function LoginBee({
  className,
  accessory,
  flapDuration,
  bobDuration,
  bobDepth,
  enterFrom,
  enterDelay = 0,
  departDelay = 0,
  departing,
  visible,
  reduce,
}: LoginBeeProps) {
  const [arrived, setArrived] = useState(false)
  const [eyesClosed, setEyesClosed] = useState(false)
  const [startled, setStartled] = useState(false)

  // 자리 잡은 뒤 2.6~5.6초 간격 랜덤 깜빡임 (벌마다 독립 타이머)
  useEffect(() => {
    if (reduce || !visible || !arrived) {
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
        2600 + Math.random() * 3000
      )
    }
    schedule()
    return () => {
      window.clearTimeout(blinkTimer)
      window.clearTimeout(openTimer)
    }
  }, [reduce, visible, arrived])

  // 탭하면 그 벌만 깜짝 놀라 몸을 세웠다가 다시 기울며 복귀
  function handleTap() {
    if (reduce || departing || !arrived || startled) {
      return
    }
    setStartled(true)
  }

  function handleComplete(definition: AnimationDefinition) {
    if (definition === 'enter') {
      setArrived(true)
    }
    if (definition === 'startled') {
      setStartled(false)
    }
  }

  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: enterFrom?.x ?? 0,
      y: enterFrom?.y ?? 0,
      rotate: CRUISE_TILT + 8,
      scale: 0.9,
      transition: { duration: 0 },
    },
    // 합류: 스프링 오버슈트로 "따라잡아서 자리 잡는" 느낌을 준다
    enter: {
      opacity: 1,
      x: 0,
      y: 0,
      rotate: CRUISE_TILT,
      scale: 1,
      transition: {
        delay: enterDelay,
        type: 'spring',
        stiffness: 64,
        damping: 11,
        mass: 0.9,
        opacity: { delay: enterDelay, duration: 0.35 },
      },
    },
    hover: {
      opacity: 1,
      x: 0,
      y: [0, -bobDepth, 0],
      rotate: CRUISE_TILT,
      scale: 1,
      transition: { y: { duration: bobDuration, repeat: Infinity, ease: 'easeInOut' } },
    },
    startled: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: [1, 1.07, 1],
      rotate: [CRUISE_TILT, 7, CRUISE_TILT - 3, CRUISE_TILT],
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
    },
    // 퇴장: 몸을 더 숙이며 오른쪽으로 가속해 화면 밖으로
    depart: {
      opacity: 1,
      x: 640,
      y: -36,
      rotate: CRUISE_TILT + 5,
      scale: 1,
      transition: { delay: departDelay, duration: 0.85, ease: [0.55, 0, 0.85, 0.55] },
    },
  }

  const animate = reduce
    ? { opacity: 1, rotate: CRUISE_TILT }
    : departing
      ? 'depart'
      : !visible
        ? 'hidden'
        : startled
          ? 'startled'
          : arrived
            ? 'hover'
            : 'enter'

  const beeClassName = [
    'login-bee is-cruise',
    accessory === 'ribbon' ? 'with-ribbon' : '',
    accessory === 'sprout' ? 'with-sprout' : '',
    eyesClosed ? 'is-eyes-closed' : '',
    startled ? 'is-surprised' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className}>
      <motion.div
        className="pointer-events-auto relative transform-gpu cursor-pointer will-change-transform"
        initial={reduce ? false : 'hidden'}
        animate={animate}
        variants={variants}
        onAnimationComplete={handleComplete}
        onClick={handleTap}
      >
        {startled && (
          <span className="animate-emoji-pop absolute -top-3 left-[64%] z-10 rotate-6 font-jua text-2xl text-ink select-none">
            !
          </span>
        )}
        <div
          className={beeClassName}
          style={{ '--login-bee-flap': flapDuration } as CSSProperties}
          dangerouslySetInnerHTML={{ __html: LOGIN_BEE_SVG }}
        />
      </motion.div>
    </div>
  )
}

interface BeeShadowProps {
  className: string
  targetOpacity: number
  breatheDuration: number
  visible: boolean
  reduce: boolean
}

function BeeShadow({ className, targetOpacity, breatheDuration, visible, reduce }: BeeShadowProps) {
  return (
    <div className={className}>
      <motion.div
        className="h-3 rounded-[50%] bg-static-black/30 blur-md"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={
          reduce
            ? { opacity: targetOpacity, scale: 1 }
            : visible
              ? { opacity: targetOpacity, scale: [1, 0.92, 1] }
              : { opacity: 0, scale: 0.6 }
        }
        transition={
          visible && !reduce
            ? {
                opacity: { duration: 0.6, ease: 'easeOut' },
                scale: { duration: breatheDuration, repeat: Infinity, ease: 'easeInOut' },
              }
            : { duration: 0.3 }
        }
      />
    </div>
  )
}

export function LoginBeeScene() {
  const shouldReduceMotion = useReducedMotion()
  const reduce = !!shouldReduceMotion
  const [phase, setPhase] = useState<ScenePhase>('solo')

  // 사이클: 혼자(1.6s) → 합류 → 순항(~8.6s) → 다같이 퇴장 → 리더 재등장 (무한 루프)
  const [cycle, setCycle] = useState(0)
  useEffect(() => {
    if (reduce) {
      return
    }
    const timers: number[] = []
    const run = () => {
      timers.push(
        window.setTimeout(() => setPhase('joining'), 1600),
        window.setTimeout(() => setPhase('cruise'), 3200),
        window.setTimeout(() => setPhase('depart'), 8600),
        window.setTimeout(() => {
          setPhase('solo')
          setCycle((count) => count + 1)
          run()
        }, 10000)
      )
    }
    run()
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [reduce])

  const cruising = reduce || phase === 'cruise'
  const rushing = !cruising
  const departing = !reduce && phase === 'depart'

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* 해는 배경 패럴랙스와 대비되도록 고정해 둔다 */}

      {/* 원경의 작은 뭉게구름 — 아주 느리게 흘러 깊이를 만든다 */}
      <motion.div
        className="absolute left-[9%] top-[5%]"
        animate={reduce ? undefined : { x: [0, -14, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="ml-4 h-3 w-9 rounded-full bg-static-white/55 blur-[2px]" />
        <div className="-mt-1.5 h-4 w-16 rounded-full bg-static-white/55 blur-[2px]" />
      </motion.div>

      {/* 굽이치는 초원 능선 2겹 — 편대가 완성되면 흐름이 잦아든다 */}

      <motion.div
        className="absolute left-[88%] top-[16%] h-24 w-52 rounded-full bg-static-white/55 blur-2xl transform-gpu will-change-transform"
        initial={{ x: 0, opacity: 0.2 }}
        animate={{ x: rushing ? -330 : -380, opacity: rushing ? 0.5 : 0.28 }}
        transition={
          rushing ? { duration: 4.6, ease: 'linear' } : { duration: 0.9, ease: [0.16, 1, 0.3, 1] }
        }
      />

      {/* 스피드라인 — 편대 완성 후에도 느리게 흘러 "함께 나아가는 중"을 유지한다 */}
      {SPEED_LINES.map((line) => (
        <motion.span
          key={`${line.className}-${line.delay}`}
          className={`absolute h-1 rounded-full bg-primary/25 transform-gpu will-change-transform ${line.className}`}
          initial={{ x: 80, opacity: 0 }}
          animate={
            reduce
              ? { opacity: 0 }
              : { x: [80, -520], opacity: rushing ? [0, 0.58, 0.5, 0] : [0, 0.26, 0.22, 0] }
          }
          transition={
            reduce
              ? undefined
              : {
                  duration: rushing ? 0.95 : 2.6,
                  delay: line.delay,
                  repeat: Infinity,
                  ease: 'linear',
                }
          }
        />
      ))}

      {/* 그림자 — 벌 크기·위치에 맞춰 초원 위에 얕게 깔린다 */}
      <BeeShadow
        className="absolute left-[56%] top-[72%] w-16 -translate-x-1/2"
        targetOpacity={0.32}
        breatheDuration={4.4}
        visible={!departing && phase !== 'solo'}
        reduce={reduce}
      />

      {/* 말풍선 — 순항 중 리더 곁에서 크게 환영 인사를 건넨다 (합류/퇴장 중엔 숨음) */}
      <motion.div
        className="absolute left-[72%] top-[20%] z-40 w-[min(62vw,240px)] -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, scale: 0.5, y: 8 }}
        animate={
          reduce
            ? { opacity: 1, scale: 1, y: 0 }
            : cruising
              ? { opacity: 1, scale: 1, y: [0, -5, 0] }
              : { opacity: 0, scale: 0.5, y: 8 }
        }
        transition={
          reduce
            ? { duration: 0.3 }
            : cruising
              ? {
                  opacity: { duration: 0.35, delay: 0.35 },
                  scale: { type: 'spring', stiffness: 260, damping: 15, delay: 0.35 },
                  y: { duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 0.7 },
                }
              : { duration: 0.25 }
        }
      >
        <div className="relative rounded-3xl bg-white px-5 py-4 shadow-[0_10px_28px_rgba(30,50,110,0.25)]">
          <p className="text-center font-jua text-[16px] leading-snug text-ink break-keep">
            두비두비에 오신 걸 환영해요!
            <br />
            함께 시작해볼까요?
          </p>
          <span className="absolute -bottom-2 left-10 h-4 w-4 rotate-45 rounded-[2px] bg-white" />
        </div>
      </motion.div>

      {/* 단독 비행 벌 */}
      <LoginBee
        key={`leader-${cycle}`}
        className="absolute left-[56%] top-[43%] z-30 w-[min(52vw,205px)] -translate-x-1/2 -translate-y-1/2"
        flapDuration={rushing ? '0.3s' : '0.48s'}
        bobDuration={4.4}
        bobDepth={6}
        enterFrom={{ x: -280, y: 24 }}
        enterDelay={0}
        departDelay={0}
        departing={departing}
        visible
        reduce={reduce}
      />
    </div>
  )
}
