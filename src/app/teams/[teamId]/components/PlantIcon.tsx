interface SvgProps {
  className?: string
}

// 씨앗 — tiny sleeping blob (gray-blue)
function SeedBlob({ className = '' }: SvgProps) {
  return (
    <svg viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="seed-b" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#D8E8F8" />
          <stop offset="100%" stopColor="#A8C0D8" />
        </radialGradient>
      </defs>
      <path
        d="M24 34 C34 33, 41 39, 41 47 C41 55, 34 60, 24 60 C14 60, 7 55, 7 47 C7 39, 14 35, 24 34Z"
        fill="url(#seed-b)"
      />
      {/* Sleeping eyes */}
      <path
        d="M16 46 Q18 44.5 20 46"
        stroke="#4A6A8A"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M28 46 Q30 44.5 32 46"
        stroke="#4A6A8A"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* ZZZ */}
      <text x="33" y="37" fontSize="5" fill="#A8C0D8" fontWeight="bold">
        z
      </text>
      <text x="36" y="33" fontSize="4" fill="#A8C0D8" fontWeight="bold">
        z
      </text>
    </svg>
  )
}

// 새싹 — small blob with tiny leaf on head
function SproutBlob({ className = '' }: SvgProps) {
  return (
    <svg viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="sp-b" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#D8F4E0" />
          <stop offset="100%" stopColor="#90D4A0" />
        </radialGradient>
      </defs>
      {/* Leaf stem */}
      <line
        x1="24"
        y1="30"
        x2="24"
        y2="22"
        stroke="#5CB870"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Leaf */}
      <path d="M24 22 C20 16 14 18 15 24 C16 28 22 27 24 23 Z" fill="#6DD480" />
      {/* Body */}
      <path
        d="M24 30 C35 29, 43 35, 43 44 C43 53, 35 59, 24 59 C13 59, 5 53, 5 44 C5 35, 13 31, 24 30Z"
        fill="url(#sp-b)"
      />
      {/* Blush */}
      <ellipse cx="16" cy="47" rx="4" ry="2.5" fill="#A8EAAC" opacity="0.7" />
      <ellipse cx="32" cy="47" rx="4" ry="2.5" fill="#A8EAAC" opacity="0.7" />
      {/* Eyes */}
      <circle cx="18" cy="43" r="3" fill="white" />
      <circle cx="30" cy="43" r="3" fill="white" />
      <circle cx="18.8" cy="43.5" r="1.8" fill="#2E4A2E" />
      <circle cx="30.8" cy="43.5" r="1.8" fill="#2E4A2E" />
      <circle cx="19.4" cy="42.8" r="0.7" fill="white" />
      <circle cx="31.4" cy="42.8" r="0.7" fill="white" />
      {/* Smile */}
      <path
        d="M19 51 Q24 55 29 51"
        stroke="#2E4A2E"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

// 식물 — medium blob with two leaves on head
function PlantBlob({ className = '' }: SvgProps) {
  return (
    <svg viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="pl-b" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#C0EEC8" />
          <stop offset="100%" stopColor="#70C080" />
        </radialGradient>
      </defs>
      {/* Stem */}
      <line
        x1="24"
        y1="28"
        x2="24"
        y2="18"
        stroke="#4CA860"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Left leaf */}
      <path d="M24 22 C19 15 11 17 13 23 C15 28 22 26 24 22 Z" fill="#5CC070" />
      {/* Right leaf */}
      <path d="M24 18 C29 11 37 13 35 19 C33 24 26 23 24 18 Z" fill="#6DD480" />
      {/* Body */}
      <path
        d="M24 28 C36 27, 45 33, 45 43 C45 53, 36 59, 24 59 C12 59, 3 53, 3 43 C3 33, 12 29, 24 28Z"
        fill="url(#pl-b)"
      />
      {/* Blush */}
      <ellipse cx="14" cy="46" rx="4.5" ry="3" fill="#90D898" opacity="0.7" />
      <ellipse cx="34" cy="46" rx="4.5" ry="3" fill="#90D898" opacity="0.7" />
      {/* Eyes */}
      <circle cx="17" cy="41" r="3.5" fill="white" />
      <circle cx="31" cy="41" r="3.5" fill="white" />
      <circle cx="18" cy="41.5" r="2" fill="#1A3A1A" />
      <circle cx="32" cy="41.5" r="2" fill="#1A3A1A" />
      <circle cx="18.7" cy="40.8" r="0.8" fill="white" />
      <circle cx="32.7" cy="40.8" r="0.8" fill="white" />
      {/* Smile */}
      <path
        d="M18 50 Q24 55 30 50"
        stroke="#1A3A1A"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

// 나무 — bigger blob with tree on head
function TreeBlob({ className = '' }: SvgProps) {
  return (
    <svg viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="tr-b" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#B0E8B8" />
          <stop offset="100%" stopColor="#58B868" />
        </radialGradient>
      </defs>
      {/* Tree trunk */}
      <rect x="22" y="22" width="4" height="8" rx="2" fill="#A07840" />
      {/* Tree canopy */}
      <ellipse cx="24" cy="16" rx="10" ry="8" fill="#48A058" />
      <ellipse cx="24" cy="13" rx="7" ry="6" fill="#5CBD6E" />
      <ellipse cx="17" cy="18" rx="5" ry="4" fill="#48A058" opacity="0.9" />
      <ellipse cx="31" cy="18" rx="5" ry="4" fill="#48A058" opacity="0.9" />
      {/* Body */}
      <path
        d="M24 26 C37 25, 46 31, 46 42 C46 53, 37 59, 24 59 C11 59, 2 53, 2 42 C2 31, 11 27, 24 26Z"
        fill="url(#tr-b)"
      />
      {/* Blush */}
      <ellipse cx="13" cy="45" rx="5" ry="3" fill="#80CC88" opacity="0.65" />
      <ellipse cx="35" cy="45" rx="5" ry="3" fill="#80CC88" opacity="0.65" />
      {/* Eyes */}
      <circle cx="16" cy="40" r="4" fill="white" />
      <circle cx="32" cy="40" r="4" fill="white" />
      <circle cx="17" cy="40.5" r="2.3" fill="#163016" />
      <circle cx="33" cy="40.5" r="2.3" fill="#163016" />
      <circle cx="17.8" cy="39.7" r="0.9" fill="white" />
      <circle cx="33.8" cy="39.7" r="0.9" fill="white" />
      {/* Big smile */}
      <path
        d="M17 50 Q24 57 31 50"
        stroke="#163016"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

// 꽃 — full bloom blob with flowers
function FlowerBlob({ className = '' }: SvgProps) {
  return (
    <svg viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="fl-b" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFE8C8" />
          <stop offset="100%" stopColor="#FFB870" />
        </radialGradient>
      </defs>
      {/* Flower petals */}
      <ellipse cx="24" cy="8" rx="3.5" ry="5" fill="#FF9EC0" />
      <ellipse cx="24" cy="8" rx="3.5" ry="5" fill="#FF9EC0" transform="rotate(45 24 16)" />
      <ellipse cx="24" cy="8" rx="3.5" ry="5" fill="#FFBF40" transform="rotate(90 24 16)" />
      <ellipse cx="24" cy="8" rx="3.5" ry="5" fill="#FF9EC0" transform="rotate(135 24 16)" />
      <ellipse cx="24" cy="8" rx="3.5" ry="5" fill="#FF9EC0" transform="rotate(180 24 16)" />
      <ellipse cx="24" cy="8" rx="3.5" ry="5" fill="#FFBF40" transform="rotate(225 24 16)" />
      <ellipse cx="24" cy="8" rx="3.5" ry="5" fill="#FF9EC0" transform="rotate(270 24 16)" />
      <ellipse cx="24" cy="8" rx="3.5" ry="5" fill="#FF9EC0" transform="rotate(315 24 16)" />
      <circle cx="24" cy="16" r="5" fill="#FFD700" />
      <circle cx="24" cy="16" r="3" fill="#FFEC60" />
      {/* Stem */}
      <line
        x1="24"
        y1="22"
        x2="24"
        y2="28"
        stroke="#5CB870"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Body */}
      <path
        d="M24 26 C37 25, 46 31, 46 42 C46 53, 37 59, 24 59 C11 59, 2 53, 2 42 C2 31, 11 27, 24 26Z"
        fill="url(#fl-b)"
      />
      {/* Blush */}
      <ellipse cx="13" cy="45" rx="5.5" ry="3.5" fill="#FFD0A0" opacity="0.7" />
      <ellipse cx="35" cy="45" rx="5.5" ry="3.5" fill="#FFD0A0" opacity="0.7" />
      {/* Eyes — happy crescents */}
      <path
        d="M12 39 Q16 35 20 39"
        stroke="#3A1A00"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M28 39 Q32 35 36 39"
        stroke="#3A1A00"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Big smile */}
      <path
        d="M15 49 Q24 57 33 49"
        stroke="#3A1A00"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Sparkle dots */}
      <circle cx="8" cy="35" r="1.5" fill="#FFD700" />
      <circle cx="40" cy="33" r="1.5" fill="#FFD700" />
      <circle cx="7" cy="50" r="1" fill="#FF9EC0" />
      <circle cx="41" cy="48" r="1" fill="#FF9EC0" />
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
  if (count >= 21) return <FlowerBlob className={className} />
  if (count >= 11) return <TreeBlob className={className} />
  if (count >= 4) return <PlantBlob className={className} />
  if (count >= 1) return <SproutBlob className={className} />
  return <SeedBlob className={className} />
}
