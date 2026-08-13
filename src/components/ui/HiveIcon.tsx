interface HiveIconProps {
  /** 렌더 너비(px) */
  size?: number
  className?: string
  /** 회색 처리(미완주 달 등) */
  muted?: boolean
}

/** pointy-top 육각형 벌집 아이콘 — MonthlyHiveCard 그리드와 같은 육각형, 같은 플랫 옐로우 */
const HEX_POINTS = '48,6 91.3,31 91.3,81 48,106 4.7,81 4.7,31'

/** 플랫 육각 벌집. 팀·수집 맥락에서만 사용한다 (세계관: 벌집 = 팀). */
export function HiveIcon({ size = 40, className = '', muted = false }: HiveIconProps) {
  return (
    <svg
      viewBox="0 0 96 112"
      width={size}
      height={Math.round(size * (112 / 96))}
      className={[muted ? 'grayscale opacity-45' : '', className].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      <defs>
        <clipPath id="hive-hex-clip">
          <polygon points={HEX_POINTS} />
        </clipPath>
      </defs>
      <polygon
        points={HEX_POINTS}
        fill="#ffe042"
        stroke="#eda020"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <g clipPath="url(#hive-hex-clip)" opacity="0.16">
        <rect x="0" y="26" width="96" height="9" fill="#eda020" />
        <rect x="0" y="51" width="96" height="9" fill="#eda020" />
        <rect x="0" y="76" width="96" height="9" fill="#eda020" />
      </g>
      <circle cx="48" cy="90" r="9" fill="#6b4416" />
    </svg>
  )
}
