import type { ReactionType } from '@/types/todo.types'

interface ReactionEmojiProps {
  type: ReactionType
  size?: number
}

// All emojis share the same visual language as AngelBlob / DevilBlob:
// – Blob body with top-left shine
// – White sclera + dark pupil + white highlight (except closed/special eyes)
// – Pink cheek blush

function LikeEmoji({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body */}
      <circle cx="20" cy="22" r="16" fill="#6DD96D" />
      {/* Shine */}
      <ellipse cx="13" cy="12" rx="6" ry="3.8" fill="rgba(255,255,255,0.32)" />
      {/* Blush */}
      <ellipse cx="11" cy="25" rx="3.5" ry="2.2" fill="#FFB5C8" opacity="0.48" />
      <ellipse cx="29" cy="25" rx="3.5" ry="2.2" fill="#FFB5C8" opacity="0.48" />
      {/* Happy squint eyes (^_^) */}
      <path
        d="M11.5 19 Q14.5 15.5 17.5 19"
        stroke="#1A0A14"
        strokeWidth="2.3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M22.5 19 Q25.5 15.5 28.5 19"
        stroke="#1A0A14"
        strokeWidth="2.3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Big smile */}
      <path
        d="M13 24.5 Q20 31 27 24.5"
        stroke="#1A0A14"
        strokeWidth="2.1"
        fill="none"
        strokeLinecap="round"
      />
      {/* Cute thumb up (top-right, outside body slightly) */}
      <ellipse cx="32" cy="18" rx="3.8" ry="3" fill="#1A0A14" />
      <ellipse cx="32" cy="12.5" rx="2.3" ry="3.3" fill="#1A0A14" />
      {/* Sparkle dots */}
      <circle cx="7" cy="9" r="2.2" fill="#FFD84D" />
      <circle cx="34" cy="7" r="1.5" fill="#FFD84D" opacity="0.75" />
    </svg>
  )
}

function HeartEmoji({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body */}
      <circle cx="20" cy="22" r="16" fill="#F585AA" />
      {/* Shine */}
      <ellipse cx="13" cy="12" rx="6" ry="3.8" fill="rgba(255,255,255,0.28)" />
      {/* Blush */}
      <ellipse cx="10" cy="27" rx="3.8" ry="2.4" fill="#FF6090" opacity="0.4" />
      <ellipse cx="30" cy="27" rx="3.8" ry="2.4" fill="#FF6090" opacity="0.4" />
      {/* Heart eyes (with highlight for dimension) */}
      <path
        d="M10.5 17 C10.5 15,13.5 13.2,14.5 15.5 C15.5 13.2,18.5 15,18.5 17 C18.5 19,14.5 22,14.5 22 C14.5 22,10.5 19,10.5 17Z"
        fill="#1A0A14"
      />
      <path
        d="M21.5 17 C21.5 15,24.5 13.2,25.5 15.5 C26.5 13.2,29.5 15,29.5 17 C29.5 19,25.5 22,25.5 22 C25.5 22,21.5 19,21.5 17Z"
        fill="#1A0A14"
      />
      {/* Heart eye highlights */}
      <circle cx="13.2" cy="16.2" r="1.4" fill="rgba(255,255,255,0.7)" />
      <circle cx="24.2" cy="16.2" r="1.4" fill="rgba(255,255,255,0.7)" />
      {/* Smile */}
      <path
        d="M14 29 Q20 34 26 29"
        stroke="#1A0A14"
        strokeWidth="2.1"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SurprisedEmoji({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body */}
      <circle cx="20" cy="22" r="16" fill="#FFD84D" />
      {/* Shine */}
      <ellipse cx="13" cy="12" rx="6" ry="3.8" fill="rgba(255,255,255,0.3)" />
      {/* Blush */}
      <ellipse cx="11" cy="25" rx="3.5" ry="2.2" fill="#FFB5C8" opacity="0.42" />
      <ellipse cx="29" cy="25" rx="3.5" ry="2.2" fill="#FFB5C8" opacity="0.42" />
      {/* Raised brows */}
      <path
        d="M11 13.5 Q13.5 11 16 13"
        stroke="#1A0A14"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M24 13 Q26.5 11 29 13.5"
        stroke="#1A0A14"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Huge open eyes — angel-style sclera + pupil */}
      <ellipse cx="15" cy="19.5" rx="5" ry="5.8" fill="white" />
      <circle cx="15.5" cy="20" r="3.8" fill="#1A0A14" />
      <circle cx="17" cy="18.2" r="1.6" fill="white" />
      <ellipse cx="25" cy="19.5" rx="5" ry="5.8" fill="white" />
      <circle cx="25.5" cy="20" r="3.8" fill="#1A0A14" />
      <circle cx="27" cy="18.2" r="1.6" fill="white" />
      {/* O mouth */}
      <ellipse cx="20" cy="29.5" rx="3.5" ry="3" fill="#1A0A14" />
      <ellipse cx="20" cy="29.5" rx="2" ry="1.8" fill="#ecd8d8" />
      {/* Sweat drop */}
      <path d="M33 9.5 C33 9.5,31 13,33 15.2 C35 13,33 9.5,33 9.5Z" fill="#8EC8F8" />
    </svg>
  )
}

function DislikeEmoji({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body */}
      <circle cx="20" cy="22" r="16" fill="#72BAE8" />
      {/* Shine */}
      <ellipse cx="13" cy="12" rx="6" ry="3.8" fill="rgba(255,255,255,0.25)" />
      {/* Blush (sad cool tone) */}
      <ellipse cx="11" cy="25.5" rx="3.5" ry="2.2" fill="#B0CCFF" opacity="0.45" />
      <ellipse cx="29" cy="25.5" rx="3.5" ry="2.2" fill="#B0CCFF" opacity="0.45" />
      {/* Sad inner-raised brows */}
      <path
        d="M11.5 15 Q13.5 12 16.5 14.5"
        stroke="#1A0A14"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M23.5 14.5 Q26.5 12 28.5 15"
        stroke="#1A0A14"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Angel-style eyes */}
      <ellipse cx="15" cy="21" rx="4.5" ry="5" fill="white" />
      <circle cx="15.5" cy="21.5" r="3.2" fill="#1A0A14" />
      <circle cx="17" cy="19.8" r="1.3" fill="white" />
      <ellipse cx="25" cy="21" rx="4.5" ry="5" fill="white" />
      <circle cx="25.5" cy="21.5" r="3.2" fill="#1A0A14" />
      <circle cx="27" cy="19.8" r="1.3" fill="white" />
      {/* Frown */}
      <path
        d="M13.5 30 Q20 25.5 26.5 30"
        stroke="#1A0A14"
        strokeWidth="2.1"
        fill="none"
        strokeLinecap="round"
      />
      {/* Tear drop */}
      <path
        d="M14 24.5 C14 24.5,11.8 28,14 29.8 C16.2 28,14 24.5,14 24.5Z"
        fill="#4AABF0"
        opacity="0.9"
      />
    </svg>
  )
}

function AngryEmoji({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body */}
      <circle cx="20" cy="22" r="16" fill="#FF7A55" />
      {/* Shine */}
      <ellipse cx="13" cy="12" rx="6" ry="3.8" fill="rgba(255,255,255,0.22)" />
      {/* Anger flush */}
      <ellipse cx="11" cy="25" rx="4" ry="2.6" fill="rgba(210,50,50,0.3)" />
      <ellipse cx="29" cy="25" rx="4" ry="2.6" fill="rgba(210,50,50,0.3)" />
      {/* Devil-style V angry brows */}
      <path d="M10 14.5 L17.5 18" stroke="#1A0A14" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M22.5 18 L30 14.5" stroke="#1A0A14" strokeWidth="2.6" strokeLinecap="round" />
      {/* Angel-style eyes (narrowed under brows) */}
      <ellipse cx="15" cy="21" rx="4" ry="3.5" fill="white" />
      <circle cx="15.5" cy="21" r="2.8" fill="#1A0A14" />
      <circle cx="16.8" cy="19.8" r="1.1" fill="white" />
      <ellipse cx="25" cy="21" rx="4" ry="3.5" fill="white" />
      <circle cx="25.5" cy="21" r="2.8" fill="#1A0A14" />
      <circle cx="26.8" cy="19.8" r="1.1" fill="white" />
      {/* Gritted teeth */}
      <rect x="13" y="27.5" width="14" height="4.5" rx="2.2" fill="#1A0A14" />
      <rect x="14" y="28" width="3" height="3.5" rx="0.8" fill="white" />
      <rect x="18.5" y="28" width="3" height="3.5" rx="0.8" fill="white" />
      <rect x="23" y="28" width="3" height="3.5" rx="0.8" fill="white" />
      {/* Steam (devil-style) */}
      <path d="M31.5 8.5 Q33.5 6.5,31.5 4.5 Q29.5 6.5,31.5 8.5Z" fill="#FF4444" opacity="0.85" />
      <path d="M35 12 Q37 10,35 8 Q33 10,35 12Z" fill="#FF4444" opacity="0.65" />
    </svg>
  )
}

const EMOJI_MAP: Record<ReactionType, (size: number) => React.ReactElement> = {
  LIKE: (s) => <LikeEmoji size={s} />,
  HEART: (s) => <HeartEmoji size={s} />,
  SURPRISED: (s) => <SurprisedEmoji size={s} />,
  DISLIKE: (s) => <DislikeEmoji size={s} />,
  ANGRY: (s) => <AngryEmoji size={s} />,
}

export function ReactionEmoji({ type, size = 28 }: ReactionEmojiProps) {
  const render = EMOJI_MAP[type]
  if (!render) return <span className="text-[18px] leading-none">{type}</span>
  return render(size)
}

export function getReactionLabel(type: ReactionType): string {
  const labels: Record<ReactionType, string> = {
    LIKE: '좋아요',
    HEART: '하트',
    SURPRISED: '놀람',
    DISLIKE: '별로',
    ANGRY: '화남',
  }
  return labels[type] ?? type
}
