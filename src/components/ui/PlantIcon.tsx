interface SvgProps {
  className?: string
}

function SeedSvg({ className = '' }: SvgProps) {
  return (
    <svg viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="seed-soil" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#3b0764" />
        </linearGradient>
        <radialGradient id="seed-body" cx="38%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#e9d5ff" />
          <stop offset="100%" stopColor="#5b21b6" />
        </radialGradient>
      </defs>
      <ellipse cx="24" cy="59" rx="16" ry="5.5" fill="url(#seed-soil)" />
      <ellipse cx="24" cy="56.5" rx="11" ry="2.5" fill="#8b5cf6" opacity="0.35" />
      <ellipse
        cx="24"
        cy="50"
        rx="5"
        ry="6.5"
        fill="url(#seed-body)"
        transform="rotate(-12 24 50)"
      />
      <path
        d="M21.5 45 C22.5 42.5 24.5 42 24.5 44.5"
        stroke="#c4b5fd"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  )
}

function SproutSvg({ className = '' }: SvgProps) {
  return (
    <svg viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="sp-soil" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#3b0764" />
        </linearGradient>
        <linearGradient id="sp-stem" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#5b21b6" />
        </linearGradient>
        <radialGradient id="sp-ll" cx="72%" cy="22%" r="65%">
          <stop offset="0%" stopColor="#ede9fe" />
          <stop offset="100%" stopColor="#5b21b6" />
        </radialGradient>
        <radialGradient id="sp-rl" cx="28%" cy="22%" r="65%">
          <stop offset="0%" stopColor="#ede9fe" />
          <stop offset="100%" stopColor="#5b21b6" />
        </radialGradient>
        <linearGradient id="sp-tip" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#f5f3ff" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <ellipse cx="24" cy="59" rx="16" ry="5.5" fill="url(#sp-soil)" />
      <ellipse cx="24" cy="56.5" rx="11" ry="2.5" fill="#8b5cf6" opacity="0.35" />
      <path
        d="M24 57 C23.5 51 23 43 24 32"
        stroke="url(#sp-stem)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      {/* Left leaf */}
      <path d="M24 46 C18 41 11 44 13 50.5 C15 57 23 53 24 48 Z" fill="url(#sp-ll)" />
      <path
        d="M24 46.5 C18.5 46.5 14 49.5 13 50.5"
        stroke="#4c1d95"
        strokeWidth="0.8"
        opacity="0.4"
        strokeLinecap="round"
      />
      {/* Right leaf */}
      <path d="M24 41 C30 36 37 39 35 45.5 C33 52 25 48 24 43 Z" fill="url(#sp-rl)" />
      <path
        d="M24 41.5 C29.5 41.5 34 44.5 35 45.5"
        stroke="#4c1d95"
        strokeWidth="0.8"
        opacity="0.4"
        strokeLinecap="round"
      />
      {/* Sprout tip */}
      <path d="M24 32 C21.5 26 20.5 20 24 15 C27.5 20 26.5 26 24 32 Z" fill="url(#sp-tip)" />
    </svg>
  )
}

function SmallPlantSvg({ className = '' }: SvgProps) {
  return (
    <svg viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="spl-soil" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#3b0764" />
        </linearGradient>
        <linearGradient id="spl-stem" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#5b21b6" />
        </linearGradient>
        <radialGradient id="spl-ll" cx="72%" cy="22%" r="65%">
          <stop offset="0%" stopColor="#ddd6fe" />
          <stop offset="100%" stopColor="#5b21b6" />
        </radialGradient>
        <radialGradient id="spl-rl" cx="28%" cy="22%" r="65%">
          <stop offset="0%" stopColor="#ddd6fe" />
          <stop offset="100%" stopColor="#5b21b6" />
        </radialGradient>
        <radialGradient id="spl-ul" cx="72%" cy="22%" r="65%">
          <stop offset="0%" stopColor="#ede9fe" />
          <stop offset="100%" stopColor="#6d28d9" />
        </radialGradient>
        <radialGradient id="spl-bud" cx="38%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#f5f3ff" />
          <stop offset="100%" stopColor="#7c3aed" />
        </radialGradient>
      </defs>
      <ellipse cx="24" cy="59" rx="16" ry="5.5" fill="url(#spl-soil)" />
      <ellipse cx="24" cy="56.5" rx="11" ry="2.5" fill="#8b5cf6" opacity="0.35" />
      <path
        d="M24 57 C23.5 50 23 40 24 22"
        stroke="url(#spl-stem)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Lower left leaf */}
      <path d="M24 48 C17 42 9 46 11.5 53 C14 60 23 55.5 24 50 Z" fill="url(#spl-ll)" />
      <path
        d="M24 48.5 C17.5 48 12.5 51.5 11.5 53"
        stroke="#4c1d95"
        strokeWidth="0.9"
        opacity="0.38"
        strokeLinecap="round"
      />
      {/* Lower right leaf */}
      <path d="M24 42 C31 36 39 40 36.5 47 C34 54 25 50 24 44 Z" fill="url(#spl-rl)" />
      <path
        d="M24 42.5 C30.5 42 35.5 45.5 36.5 47"
        stroke="#4c1d95"
        strokeWidth="0.9"
        opacity="0.38"
        strokeLinecap="round"
      />
      {/* Upper left leaf */}
      <path d="M24 32 C19 27 13 30 15 35.5 C17 41 23 37.5 24 33.5 Z" fill="url(#spl-ul)" />
      <path
        d="M24 32.5 C19.5 32 15.5 34.5 15 35.5"
        stroke="#4c1d95"
        strokeWidth="0.8"
        opacity="0.38"
        strokeLinecap="round"
      />
      {/* Bud */}
      <ellipse cx="24" cy="19.5" rx="5" ry="6.5" fill="url(#spl-bud)" />
      <path
        d="M21.5 15 C22.5 12.5 24.5 12 24.5 15"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  )
}

function MediumPlantSvg({ className = '' }: SvgProps) {
  return (
    <svg viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="mp-soil" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#3b0764" />
        </linearGradient>
        <linearGradient id="mp-stem" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#5b21b6" />
        </linearGradient>
        <radialGradient id="mp-l1" cx="72%" cy="22%" r="65%">
          <stop offset="0%" stopColor="#ddd6fe" />
          <stop offset="100%" stopColor="#5b21b6" />
        </radialGradient>
        <radialGradient id="mp-r1" cx="28%" cy="22%" r="65%">
          <stop offset="0%" stopColor="#ddd6fe" />
          <stop offset="100%" stopColor="#5b21b6" />
        </radialGradient>
        <radialGradient id="mp-l2" cx="72%" cy="22%" r="65%">
          <stop offset="0%" stopColor="#e9d5ff" />
          <stop offset="100%" stopColor="#6d28d9" />
        </radialGradient>
        <radialGradient id="mp-r2" cx="28%" cy="22%" r="65%">
          <stop offset="0%" stopColor="#e9d5ff" />
          <stop offset="100%" stopColor="#6d28d9" />
        </radialGradient>
        <radialGradient id="mp-top" cx="50%" cy="20%" r="65%">
          <stop offset="0%" stopColor="#f5f3ff" />
          <stop offset="100%" stopColor="#6d28d9" />
        </radialGradient>
      </defs>
      <ellipse cx="24" cy="59" rx="16" ry="5.5" fill="url(#mp-soil)" />
      <ellipse cx="24" cy="56.5" rx="11" ry="2.5" fill="#8b5cf6" opacity="0.35" />
      <path
        d="M24 57 C23.5 49 23 38 24 18"
        stroke="url(#mp-stem)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Lower left leaf */}
      <path d="M24 48 C16 42 8 46 10.5 53.5 C13 61 23 56.5 24 50 Z" fill="url(#mp-l1)" />
      <path
        d="M24 48.5 C17 48 11.5 51.5 10.5 53.5"
        stroke="#4c1d95"
        strokeWidth="1"
        opacity="0.35"
        strokeLinecap="round"
      />
      {/* Lower right leaf */}
      <path d="M24 42 C32 36 40 40 37.5 47.5 C35 55 25 51 24 44 Z" fill="url(#mp-r1)" />
      <path
        d="M24 42.5 C31 42 36 45.5 37.5 47.5"
        stroke="#4c1d95"
        strokeWidth="1"
        opacity="0.35"
        strokeLinecap="round"
      />
      {/* Upper left leaf */}
      <path d="M24 32 C18 27 11 30.5 13.5 37 C16 43.5 23 39.5 24 34 Z" fill="url(#mp-l2)" />
      <path
        d="M24 32.5 C19 32 14.5 35 13.5 37"
        stroke="#4c1d95"
        strokeWidth="0.9"
        opacity="0.35"
        strokeLinecap="round"
      />
      {/* Upper right leaf */}
      <path d="M24 27 C30 22 37 25.5 34.5 32 C32 38.5 25 35 24 29 Z" fill="url(#mp-r2)" />
      <path
        d="M24 27.5 C29 27 33.5 30 34.5 32"
        stroke="#4c1d95"
        strokeWidth="0.9"
        opacity="0.35"
        strokeLinecap="round"
      />
      {/* Top cluster */}
      <path d="M24 18 C20 13 15 15.5 17.5 21.5 C20 27.5 24 23.5 24 20 Z" fill="url(#mp-top)" />
      <path
        d="M24 18 C28 13 33 15.5 30.5 21.5 C28 27.5 24 23.5 24 20 Z"
        fill="url(#mp-top)"
        opacity="0.88"
      />
    </svg>
  )
}

function FlowerSvg({ className = '' }: SvgProps) {
  return (
    <svg viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="fl-soil" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#3b0764" />
        </linearGradient>
        <linearGradient id="fl-stem" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#5b21b6" />
        </linearGradient>
        <radialGradient id="fl-ll" cx="72%" cy="22%" r="65%">
          <stop offset="0%" stopColor="#ddd6fe" />
          <stop offset="100%" stopColor="#5b21b6" />
        </radialGradient>
        <radialGradient id="fl-rl" cx="28%" cy="22%" r="65%">
          <stop offset="0%" stopColor="#ddd6fe" />
          <stop offset="100%" stopColor="#5b21b6" />
        </radialGradient>
        <radialGradient id="fl-petal" cx="50%" cy="20%" r="70%">
          <stop offset="0%" stopColor="#f5f3ff" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </radialGradient>
        <radialGradient id="fl-center" cx="38%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
      </defs>
      <ellipse cx="24" cy="59" rx="16" ry="5.5" fill="url(#fl-soil)" />
      <ellipse cx="24" cy="56.5" rx="11" ry="2.5" fill="#8b5cf6" opacity="0.35" />
      <path
        d="M24 57 C23.5 51 23.5 44 24 34"
        stroke="url(#fl-stem)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Left leaf */}
      <path d="M24 47 C17 42 10 45.5 12.5 52 C15 58.5 23 54.5 24 49 Z" fill="url(#fl-ll)" />
      <path
        d="M24 47.5 C18 47 13 50 12.5 52"
        stroke="#4c1d95"
        strokeWidth="0.9"
        opacity="0.4"
        strokeLinecap="round"
      />
      {/* Right leaf */}
      <path d="M24 41 C31 36 38 39.5 35.5 46 C33 52.5 25 49 24 43 Z" fill="url(#fl-rl)" />
      <path
        d="M24 41.5 C30 41 34.5 44 35.5 46"
        stroke="#4c1d95"
        strokeWidth="0.9"
        opacity="0.4"
        strokeLinecap="round"
      />
      {/* 6 petals rotating around (24, 19) */}
      <ellipse
        cx="24"
        cy="12"
        rx="4"
        ry="6.5"
        fill="url(#fl-petal)"
        transform="rotate(0, 24, 19)"
      />
      <ellipse
        cx="24"
        cy="12"
        rx="4"
        ry="6.5"
        fill="url(#fl-petal)"
        transform="rotate(60, 24, 19)"
        opacity="0.92"
      />
      <ellipse
        cx="24"
        cy="12"
        rx="4"
        ry="6.5"
        fill="url(#fl-petal)"
        transform="rotate(120, 24, 19)"
        opacity="0.84"
      />
      <ellipse
        cx="24"
        cy="12"
        rx="4"
        ry="6.5"
        fill="url(#fl-petal)"
        transform="rotate(180, 24, 19)"
        opacity="0.78"
      />
      <ellipse
        cx="24"
        cy="12"
        rx="4"
        ry="6.5"
        fill="url(#fl-petal)"
        transform="rotate(240, 24, 19)"
        opacity="0.84"
      />
      <ellipse
        cx="24"
        cy="12"
        rx="4"
        ry="6.5"
        fill="url(#fl-petal)"
        transform="rotate(300, 24, 19)"
        opacity="0.92"
      />
      {/* Flower center */}
      <circle cx="24" cy="19" r="5.5" fill="url(#fl-center)" />
      <circle cx="22.5" cy="17.5" r="1.5" fill="white" opacity="0.55" />
    </svg>
  )
}

export function getPlantStageLabel(count: number): string {
  if (count >= 21) return '꽃'
  if (count >= 11) return '나무'
  if (count >= 4) return '식물'
  if (count >= 1) return '새싹'
  return '씨앗'
}

interface PlantIconProps {
  count: number
  className?: string
}

export function PlantIcon({ count, className = 'w-full h-full' }: PlantIconProps) {
  if (count >= 21) return <FlowerSvg className={className} />
  if (count >= 11) return <MediumPlantSvg className={className} />
  if (count >= 4) return <SmallPlantSvg className={className} />
  if (count >= 1) return <SproutSvg className={className} />
  return <SeedSvg className={className} />
}
