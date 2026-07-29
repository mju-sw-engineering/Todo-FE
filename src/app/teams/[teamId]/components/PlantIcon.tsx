interface SvgProps {
  className?: string
}

// 씨앗 — small dot
function SeedIcon({ className = '' }: SvgProps) {
  return (
    <svg viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="24" cy="44" r="7" fill="#A8C0D8" />
    </svg>
  )
}

// 새싹 — stem + one leaf
function SproutIcon({ className = '' }: SvgProps) {
  return (
    <svg viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <line
        x1="24"
        y1="52"
        x2="24"
        y2="34"
        stroke="#5CB870"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M24 36 C19 29 12 31 14 38 C16 43 23 41 24 36 Z" fill="#6DD480" />
    </svg>
  )
}

// 식물 — stem + two leaves
function PlantIconGlyph({ className = '' }: SvgProps) {
  return (
    <svg viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <line
        x1="24"
        y1="54"
        x2="24"
        y2="26"
        stroke="#4CA860"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M24 30 C18 22 9 24 11 32 C13 38 22 36 24 30 Z" fill="#5CC070" />
      <path d="M24 24 C30 16 39 18 37 26 C35 32 26 30 24 24 Z" fill="#6DD480" />
    </svg>
  )
}

// 나무 — simple tree silhouette
function TreeIconGlyph({ className = '' }: SvgProps) {
  return (
    <svg viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="21" y="42" width="6" height="16" rx="2" fill="#A07840" />
      <ellipse cx="24" cy="26" rx="16" ry="14" fill="#48A058" />
      <ellipse cx="24" cy="20" rx="11" ry="10" fill="#5CBD6E" />
    </svg>
  )
}

// 꽃 — simple flower silhouette
function FlowerIconGlyph({ className = '' }: SvgProps) {
  return (
    <svg viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <line
        x1="24"
        y1="58"
        x2="24"
        y2="34"
        stroke="#5CB870"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse cx="24" cy="16" rx="4" ry="6" fill="#FF9EC0" />
      <ellipse cx="24" cy="16" rx="4" ry="6" fill="#FF9EC0" transform="rotate(45 24 24)" />
      <ellipse cx="24" cy="16" rx="4" ry="6" fill="#FFBF40" transform="rotate(90 24 24)" />
      <ellipse cx="24" cy="16" rx="4" ry="6" fill="#FF9EC0" transform="rotate(135 24 24)" />
      <ellipse cx="24" cy="16" rx="4" ry="6" fill="#FF9EC0" transform="rotate(180 24 24)" />
      <ellipse cx="24" cy="16" rx="4" ry="6" fill="#FFBF40" transform="rotate(225 24 24)" />
      <ellipse cx="24" cy="16" rx="4" ry="6" fill="#FF9EC0" transform="rotate(270 24 24)" />
      <ellipse cx="24" cy="16" rx="4" ry="6" fill="#FF9EC0" transform="rotate(315 24 24)" />
      <circle cx="24" cy="24" r="6" fill="#FFD700" />
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
  if (count >= 21) return <FlowerIconGlyph className={className} />
  if (count >= 11) return <TreeIconGlyph className={className} />
  if (count >= 4) return <PlantIconGlyph className={className} />
  if (count >= 1) return <SproutIcon className={className} />
  return <SeedIcon className={className} />
}
