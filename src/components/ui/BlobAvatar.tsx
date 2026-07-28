interface BlobAvatarProps {
  seed: string
  size?: number
  className?: string
}

function hashSeed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

const VARIANTS = [
  { bg: '#78D878', text: '#0F3D0F' }, // green
  { bg: '#F585AA', text: '#4D0F26' }, // pink
  { bg: '#7AAEE8', text: '#0F2A4D' }, // blue
  { bg: '#F5CC5A', text: '#4D3A0F' }, // yellow
  { bg: '#F5A870', text: '#4D260F' }, // peach
]

export function BlobAvatar({ seed, size = 40, className = '' }: BlobAvatarProps) {
  const hash = hashSeed(seed)
  const v = VARIANTS[hash % VARIANTS.length]
  const initial = seed.trim().charAt(0).toUpperCase() || '?'

  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size, background: v.bg }}
    >
      <span className="font-bold leading-none" style={{ fontSize: size * 0.4, color: v.text }}>
        {initial}
      </span>
    </div>
  )
}
