interface BlobAvatarProps {
  seed: string
  size?: number
  className?: string
  expressionOverride?: number // 0-4
  variantOverride?: number // 0-4
}

function hashSeed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

// Matching AngelBlob / DevilBlob color language
const VARIANTS = [
  { body: '#78D878', bodyLight: '#A8EEA8', bg: '#F0FFF4' }, // green
  { body: '#F585AA', bodyLight: '#FFBBD0', bg: '#FFF4F7' }, // pink
  { body: '#7AAEE8', bodyLight: '#AACDF8', bg: '#F0F6FF' }, // blue
  { body: '#F5CC5A', bodyLight: '#FFE89A', bg: '#FFFBF0' }, // yellow
  { body: '#F5A870', bodyLight: '#FFD0A8', bg: '#FFF8F4' }, // peach
]

// Eyes: all use white-sclera + dark-pupil + highlight (matching angel/devil style)
// Blush: always in base, expressions add extra if needed
const EXPRESSIONS = [
  // 0: happy (^_^ squinting, closed arch eyes)
  () => (
    <>
      <path
        d="M22 37 Q28 32 34 37"
        stroke="#1A0A14"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M46 37 Q52 32 58 37"
        stroke="#1A0A14"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M26 52 Q40 62 54 52"
        stroke="#1A0A14"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  // 1: grin (open round eyes + wide smile — angel-style)
  () => (
    <>
      <ellipse cx="28" cy="37" rx="5" ry="5.5" fill="white" />
      <circle cx="29" cy="37.5" r="3.5" fill="#1A0A14" />
      <circle cx="30.5" cy="36" r="1.4" fill="white" />
      <ellipse cx="52" cy="37" rx="5" ry="5.5" fill="white" />
      <circle cx="53" cy="37.5" r="3.5" fill="#1A0A14" />
      <circle cx="54.5" cy="36" r="1.4" fill="white" />
      <path
        d="M28 53 Q40 63 52 53"
        stroke="#1A0A14"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  // 2: surprised (huge sclera, small pupils, O-mouth)
  () => (
    <>
      <ellipse cx="28" cy="37" rx="6" ry="7" fill="white" />
      <circle cx="28.5" cy="37.5" r="4.2" fill="#1A0A14" />
      <circle cx="30" cy="35.5" r="1.7" fill="white" />
      <ellipse cx="52" cy="37" rx="6" ry="7" fill="white" />
      <circle cx="52.5" cy="37.5" r="4.2" fill="#1A0A14" />
      <circle cx="54" cy="35.5" r="1.7" fill="white" />
      <ellipse cx="40" cy="55" rx="5.5" ry="5" fill="#1A0A14" />
      <ellipse cx="40" cy="55" rx="3.4" ry="3.1" fill="white" />
    </>
  ),
  // 3: shy (arch eyes + strong extra blush)
  () => (
    <>
      <path
        d="M22 37 Q28 32 34 37"
        stroke="#1A0A14"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M46 37 Q52 32 58 37"
        stroke="#1A0A14"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="22" cy="51" rx="9" ry="5.5" fill="#FFB5C8" opacity="0.55" />
      <ellipse cx="58" cy="51" rx="9" ry="5.5" fill="#FFB5C8" opacity="0.55" />
      <path
        d="M30 54 Q40 60 50 54"
        stroke="#1A0A14"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  // 4: calm (half-open eyes + flat brows + gentle smile)
  () => (
    <>
      <path
        d="M23 30 Q28 28 33 30"
        stroke="#1A0A14"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M47 30 Q52 28 57 30"
        stroke="#1A0A14"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="28" cy="37" rx="5" ry="5.5" fill="white" />
      <circle cx="29" cy="37.5" r="3.5" fill="#1A0A14" />
      <circle cx="30.5" cy="36" r="1.4" fill="white" />
      <ellipse cx="52" cy="37" rx="5" ry="5.5" fill="white" />
      <circle cx="53" cy="37.5" r="3.5" fill="#1A0A14" />
      <circle cx="54.5" cy="36" r="1.4" fill="white" />
      <path
        d="M29 53 Q40 59 51 53"
        stroke="#1A0A14"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
]

export function BlobAvatar({
  seed,
  size = 40,
  className = '',
  expressionOverride,
  variantOverride,
}: BlobAvatarProps) {
  const hash = hashSeed(seed)
  const vIdx =
    variantOverride !== undefined ? variantOverride % VARIANTS.length : hash % VARIANTS.length
  const eIdx =
    expressionOverride !== undefined
      ? expressionOverride % EXPRESSIONS.length
      : (hash >> 3) % EXPRESSIONS.length
  const v = VARIANTS[vIdx]
  const ExprFn = EXPRESSIONS[eIdx]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <rect width="80" height="80" rx="40" fill={v.bg} />

      {/* Body blob */}
      <circle cx="40" cy="44" r="32" fill={v.body} />

      {/* Body shine (matching AngelBlob / DevilBlob gloss) */}
      <ellipse cx="30" cy="29" rx="11" ry="7" fill="rgba(255,255,255,0.32)" />

      {/* Blush (always present, same placement as angel) */}
      <ellipse cx="22" cy="54" rx="7" ry="4.5" fill="#FFB5C8" opacity="0.42" />
      <ellipse cx="58" cy="54" rx="7" ry="4.5" fill="#FFB5C8" opacity="0.42" />

      {/* Expression (eyes + mouth) */}
      <ExprFn />
    </svg>
  )
}
