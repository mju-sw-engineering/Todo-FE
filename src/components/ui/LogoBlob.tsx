interface LogoBlobProps {
  size?: number
  className?: string
}

export function LogoBlob({ size = 32, className = '' }: LogoBlobProps) {
  const id = 'logo-grad'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Dark background pill */}
      <rect width="80" height="80" rx="20" fill="#111111" />

      {/* Green blob body */}
      <ellipse cx="40" cy="47" rx="27" ry="25" fill="#78D878" />

      {/* Happy squinting eyes */}
      <path
        d="M26 40 Q30 35 34 40"
        stroke="#111"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M46 40 Q50 35 54 40"
        stroke="#111"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Big smile */}
      <path
        d="M28 55 Q40 65 52 55"
        stroke="#111"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Checkmark badge — top right */}
      <circle cx="60" cy="20" r="12" fill="#FFD84D" />
      <path
        d="M54 20 L58 24 L66 15"
        stroke="#111"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Sparkle dots */}
      <circle cx="18" cy="22" r="3" fill="#FFD84D" opacity="0.7" />
      <circle cx="14" cy="32" r="2" fill="#78D878" opacity="0.5" />
    </svg>
  )
}
