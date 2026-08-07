interface HiveIconProps {
  /** 렌더 너비(px) */
  size?: number
  className?: string
  /** 회색 처리(미완주 달 등) */
  muted?: boolean
}

/** 글로시 스켑 벌집. 팀·수집 맥락에서만 사용한다 (세계관: 벌집 = 팀). */
export function HiveIcon({ size = 40, className = '', muted = false }: HiveIconProps) {
  return (
    <svg
      viewBox="0 0 140 132"
      width={size}
      height={Math.round(size * (132 / 140))}
      className={[muted ? 'grayscale opacity-45' : '', className].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hive-band-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd97a" />
          <stop offset="0.55" stopColor="#f9b93e" />
          <stop offset="1" stopColor="#eda020" />
        </linearGradient>
        <linearGradient id="hive-band-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe093" />
          <stop offset="0.55" stopColor="#fbc14e" />
          <stop offset="1" stopColor="#f0a728" />
        </linearGradient>
      </defs>
      <circle cx="70" cy="12" r="6" fill="none" stroke="#c88a1c" strokeWidth="3.5" />
      <rect x="46" y="16" width="48" height="20" rx="10" fill="url(#hive-band-b)" />
      <rect x="33" y="30" width="74" height="22" rx="11" fill="url(#hive-band-a)" />
      <rect x="25" y="46" width="90" height="24" rx="12" fill="url(#hive-band-b)" />
      <rect x="29" y="64" width="82" height="23" rx="11.5" fill="url(#hive-band-a)" />
      <rect x="39" y="81" width="62" height="21" rx="10.5" fill="url(#hive-band-b)" />
      <rect x="37" y="29" width="66" height="4" rx="2" fill="#c47f12" opacity="0.26" />
      <rect x="29" y="45" width="82" height="4" rx="2" fill="#c47f12" opacity="0.26" />
      <rect x="33" y="63" width="74" height="4" rx="2" fill="#c47f12" opacity="0.26" />
      <rect x="43" y="80" width="54" height="4" rx="2" fill="#c47f12" opacity="0.26" />
      <ellipse
        cx="47"
        cy="40"
        rx="13"
        ry="6.5"
        fill="#ffffff"
        opacity="0.42"
        transform="rotate(-14 47 40)"
      />
      <ellipse
        cx="43"
        cy="58"
        rx="8.5"
        ry="4.5"
        fill="#ffffff"
        opacity="0.26"
        transform="rotate(-12 43 58)"
      />
      <circle cx="70" cy="86" r="10.5" fill="#6b4416" />
      <ellipse cx="70" cy="82.5" rx="7.5" ry="4" fill="#4e300d" />
      <path
        d="M70 96.5 c0 4.5 -3 6.2 -3 9.4 a3 3 0 0 0 6 0 C73 102.7 70 101 70 96.5z"
        fill="#f6a51f"
      />
    </svg>
  )
}
