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
