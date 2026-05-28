interface BlobProps {
  size?: number
  className?: string
}

export function AngelBlob({ size = 80, className = '' }: BlobProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Halo glow */}
      <ellipse
        cx="60"
        cy="13"
        rx="21"
        ry="6.5"
        fill="none"
        stroke="#FFD700"
        strokeWidth="3.5"
        opacity="0.9"
      />
      <ellipse
        cx="60"
        cy="13"
        rx="21"
        ry="6.5"
        fill="none"
        stroke="#FFE866"
        strokeWidth="1.5"
        opacity="0.5"
      />

      {/* Wings */}
      <ellipse
        cx="16"
        cy="58"
        rx="17"
        ry="11"
        fill="#EEF4FF"
        opacity="0.92"
        transform="rotate(-18 16 58)"
      />
      <ellipse
        cx="14"
        cy="60"
        rx="10"
        ry="7"
        fill="#DCE9FF"
        opacity="0.7"
        transform="rotate(-18 14 60)"
      />
      <ellipse
        cx="104"
        cy="58"
        rx="17"
        ry="11"
        fill="#EEF4FF"
        opacity="0.92"
        transform="rotate(18 104 58)"
      />
      <ellipse
        cx="106"
        cy="60"
        rx="10"
        ry="7"
        fill="#DCE9FF"
        opacity="0.7"
        transform="rotate(18 106 60)"
      />

      {/* Body blob */}
      <path
        d="M60 24 C82 22, 102 40, 104 63 C106 86, 88 102, 60 103 C32 103, 14 87, 16 63 C18 40, 38 26, 60 24Z"
        fill="url(#angelGrad)"
      />

      {/* Blush */}
      <ellipse cx="39" cy="73" rx="9" ry="5" fill="#FFB5C8" opacity="0.55" />
      <ellipse cx="81" cy="73" rx="9" ry="5" fill="#FFB5C8" opacity="0.55" />

      {/* Eyes */}
      <ellipse cx="46" cy="60" rx="7.5" ry="8" fill="white" />
      <ellipse cx="74" cy="60" rx="7.5" ry="8" fill="white" />
      <circle cx="47.5" cy="61" r="4.5" fill="#2A0F1C" />
      <circle cx="75.5" cy="61" r="4.5" fill="#2A0F1C" />
      <circle cx="49" cy="59" r="1.8" fill="white" />
      <circle cx="77" cy="59" r="1.8" fill="white" />

      {/* Smile */}
      <path
        d="M48 79 Q60 87 72 79"
        stroke="#2A0F1C"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Sparkle */}
      <path
        d="M92 30 L93.5 34 L97 35.5 L93.5 37 L92 41 L90.5 37 L87 35.5 L90.5 34Z"
        fill="#FFD700"
        opacity="0.8"
      />

      <defs>
        <linearGradient id="angelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF8FC" />
          <stop offset="50%" stopColor="#FFE8F4" />
          <stop offset="100%" stopColor="#FFD6EC" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function DevilBlob({ size = 80, className = '' }: BlobProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Horns */}
      <path d="M42 32 L34 12 L50 24 Z" fill="#FF6B9D" />
      <path d="M42 32 L34 12 L50 24 Z" fill="url(#hornGrad)" />
      <path d="M78 32 L70 24 L86 12 Z" fill="#FF6B9D" />
      <path d="M78 32 L70 24 L86 12 Z" fill="url(#hornGrad2)" />
      <ellipse cx="42" cy="31" rx="7" ry="4" fill="#FF8CAF" opacity="0.6" />
      <ellipse cx="78" cy="31" rx="7" ry="4" fill="#FF8CAF" opacity="0.6" />

      {/* Body blob */}
      <path
        d="M60 28 C84 25, 104 44, 106 67 C108 91, 90 106, 60 107 C30 107, 12 91, 14 67 C16 44, 36 31, 60 28Z"
        fill="url(#devilGrad)"
      />

      {/* Blush */}
      <ellipse cx="39" cy="76" rx="9" ry="5" fill="#FF9EC0" opacity="0.5" />
      <ellipse cx="81" cy="76" rx="9" ry="5" fill="#FF9EC0" opacity="0.5" />

      {/* Eyes */}
      <ellipse cx="46" cy="63" rx="7.5" ry="8" fill="white" />
      <ellipse cx="74" cy="63" rx="7.5" ry="8" fill="white" />
      <circle cx="47.5" cy="64" r="4.5" fill="#2A0F1C" />
      <circle cx="75.5" cy="64" r="4.5" fill="#2A0F1C" />
      <circle cx="49" cy="62" r="1.8" fill="white" />
      <circle cx="77" cy="62" r="1.8" fill="white" />

      {/* Evil brows */}
      <path d="M40 53 L56 58" stroke="#2A0F1C" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M64 58 L80 53" stroke="#2A0F1C" strokeWidth="2.8" strokeLinecap="round" />

      {/* Smirk */}
      <path
        d="M49 83 Q62 93 74 83"
        stroke="#2A0F1C"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Tail */}
      <path
        d="M60 107 C64 113, 70 111, 74 118 C78 125, 68 119, 64 112"
        stroke="#FF6B9D"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      <defs>
        <linearGradient id="devilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE8F0" />
          <stop offset="50%" stopColor="#FFD0E4" />
          <stop offset="100%" stopColor="#FFBAD8" />
        </linearGradient>
        <linearGradient id="hornGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B9D" />
          <stop offset="100%" stopColor="#FF4D7A" />
        </linearGradient>
        <linearGradient id="hornGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B9D" />
          <stop offset="100%" stopColor="#FF4D7A" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function AiBlob({ size = 80, className = '' }: BlobProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Antenna */}
      <line
        x1="60"
        y1="26"
        x2="60"
        y2="9"
        stroke="#6A90FF"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Tip glow */}
      <circle cx="60" cy="7" r="7" fill="#4A6EFF" opacity="0.18" />
      <circle cx="60" cy="7" r="4" fill="#5B7FFF" />
      <circle cx="60" cy="7" r="2.5" fill="#9AB8FF" />
      <circle cx="61" cy="5.8" r="1.2" fill="white" opacity="0.85" />

      {/* Body blob */}
      <path
        d="M60 24 C82 22, 102 40, 104 63 C106 86, 88 102, 60 103 C32 103, 14 87, 16 63 C18 40, 38 26, 60 24Z"
        fill="url(#aiGrad)"
      />

      {/* Body shine */}
      <ellipse
        cx="44"
        cy="36"
        rx="15"
        ry="9"
        fill="rgba(255,255,255,0.13)"
        transform="rotate(-12 44 36)"
      />

      {/* Circuit accents — left */}
      <path
        d="M22 57 L32 57 L32 49 L38 49"
        stroke="#6A90FF"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.42"
      />
      <circle cx="38" cy="49" r="2" fill="#6A90FF" opacity="0.48" />
      <path
        d="M20 72 L28 72 L28 79"
        stroke="#6A90FF"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.28"
      />

      {/* Circuit accents — right */}
      <path
        d="M98 57 L88 57 L88 49 L82 49"
        stroke="#6A90FF"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.42"
      />
      <circle cx="82" cy="49" r="2" fill="#6A90FF" opacity="0.48" />
      <path
        d="M100 72 L92 72 L92 79"
        stroke="#6A90FF"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.28"
      />

      {/* Blue blush */}
      <ellipse cx="38" cy="74" rx="9" ry="5" fill="#A0C0FF" opacity="0.32" />
      <ellipse cx="82" cy="74" rx="9" ry="5" fill="#A0C0FF" opacity="0.32" />

      {/* Eyes */}
      <ellipse cx="46" cy="60" rx="7.5" ry="8" fill="white" />
      <ellipse cx="74" cy="60" rx="7.5" ry="8" fill="white" />
      {/* Blue iris */}
      <circle cx="47.5" cy="61" r="4.5" fill="#2248D8" />
      <circle cx="75.5" cy="61" r="4.5" fill="#2248D8" />
      {/* Inner bright ring */}
      <circle cx="47.5" cy="61" r="2.8" fill="#5B8FFF" />
      <circle cx="75.5" cy="61" r="2.8" fill="#5B8FFF" />
      {/* Pupil */}
      <circle cx="47.5" cy="61" r="1.4" fill="#08144A" />
      <circle cx="75.5" cy="61" r="1.4" fill="#08144A" />
      {/* Highlights */}
      <circle cx="49.2" cy="59.2" r="1.4" fill="white" />
      <circle cx="77.2" cy="59.2" r="1.4" fill="white" />

      {/* Smile */}
      <path
        d="M48 79 Q60 88 72 79"
        stroke="#9AB8FF"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      <defs>
        <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2C3E9A" />
          <stop offset="50%" stopColor="#1A2778" />
          <stop offset="100%" stopColor="#0E1550" />
        </linearGradient>
      </defs>
    </svg>
  )
}
