import { useId } from 'react'

interface Props {
  /** 1~4. 범위를 벗어나면 가장 가까운 단계로 보정 */
  level: number
  size?: number
}

/**
 * 팀 벌집 성장 단계 일러스트 (시안 확정안).
 * Lv.1 새 벌집(밴드 2) → Lv.2 자라는(밴드 3) → Lv.3 튼튼한(기본형) → Lv.4 꿀샘(꿀 흐름+반짝+광배)
 */
export function TeamHiveIcon({ level, size = 46 }: Props) {
  const uid = useId()
  const bandA = `${uid}-bandA`
  const bandB = `${uid}-bandB`
  const honey = `${uid}-honey`
  const clamped = Math.min(4, Math.max(1, Math.round(level)))

  const defs = (
    <defs>
      <linearGradient id={bandA} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffd97a" />
        <stop offset="0.55" stopColor="#f9b93e" />
        <stop offset="1" stopColor="#eda020" />
      </linearGradient>
      <linearGradient id={bandB} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffe093" />
        <stop offset="0.55" stopColor="#fbc14e" />
        <stop offset="1" stopColor="#f0a728" />
      </linearGradient>
      <linearGradient id={honey} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffcf5e" />
        <stop offset="1" stopColor="#f39d17" />
      </linearGradient>
    </defs>
  )

  if (clamped === 1) {
    return (
      <svg viewBox="0 0 140 132" width={size} aria-label="새 벌집 (Lv.1)">
        {defs}
        <circle cx="70" cy="52" r="5" fill="none" stroke="#c88a1c" strokeWidth="3" />
        <rect x="44" y="55" width="52" height="22" rx="11" fill={`url(#${bandB})`} />
        <rect x="36" y="72" width="68" height="26" rx="13" fill={`url(#${bandA})`} />
        <rect x="47" y="70" width="46" height="4" rx="2" fill="#c47f12" opacity="0.26" />
        <ellipse
          cx="52"
          cy="80"
          rx="8"
          ry="4.5"
          fill="#fff"
          opacity="0.4"
          transform="rotate(-12 52 80)"
        />
        <circle cx="70" cy="88" r="7.5" fill="#6b4416" />
      </svg>
    )
  }

  if (clamped === 2) {
    return (
      <svg viewBox="0 0 140 132" width={size} aria-label="자라는 벌집 (Lv.2)">
        {defs}
        <circle cx="70" cy="34" r="5.5" fill="none" stroke="#c88a1c" strokeWidth="3.2" />
        <rect x="46" y="38" width="48" height="21" rx="10.5" fill={`url(#${bandB})`} />
        <rect x="34" y="54" width="72" height="24" rx="12" fill={`url(#${bandA})`} />
        <rect x="40" y="74" width="60" height="23" rx="11.5" fill={`url(#${bandB})`} />
        <rect x="38" y="52" width="64" height="4" rx="2" fill="#c47f12" opacity="0.26" />
        <rect x="44" y="72" width="52" height="4" rx="2" fill="#c47f12" opacity="0.26" />
        <ellipse
          cx="49"
          cy="62"
          rx="10"
          ry="5.5"
          fill="#fff"
          opacity="0.4"
          transform="rotate(-13 49 62)"
        />
        <circle cx="70" cy="86" r="9" fill="#6b4416" />
      </svg>
    )
  }

  if (clamped === 3) {
    return (
      <svg viewBox="0 0 140 132" width={size} aria-label="튼튼한 벌집 (Lv.3)">
        {defs}
        <circle cx="70" cy="12" r="6" fill="none" stroke="#c88a1c" strokeWidth="3.5" />
        <rect x="46" y="16" width="48" height="20" rx="10" fill={`url(#${bandB})`} />
        <rect x="33" y="30" width="74" height="22" rx="11" fill={`url(#${bandA})`} />
        <rect x="25" y="46" width="90" height="24" rx="12" fill={`url(#${bandB})`} />
        <rect x="29" y="64" width="82" height="23" rx="11.5" fill={`url(#${bandA})`} />
        <rect x="39" y="81" width="62" height="21" rx="10.5" fill={`url(#${bandB})`} />
        <rect x="37" y="29" width="66" height="4" rx="2" fill="#c47f12" opacity="0.26" />
        <rect x="29" y="45" width="82" height="4" rx="2" fill="#c47f12" opacity="0.26" />
        <rect x="33" y="63" width="74" height="4" rx="2" fill="#c47f12" opacity="0.26" />
        <rect x="43" y="80" width="54" height="4" rx="2" fill="#c47f12" opacity="0.26" />
        <ellipse
          cx="47"
          cy="40"
          rx="13"
          ry="6.5"
          fill="#fff"
          opacity="0.42"
          transform="rotate(-14 47 40)"
        />
        <ellipse
          cx="43"
          cy="58"
          rx="8.5"
          ry="4.5"
          fill="#fff"
          opacity="0.26"
          transform="rotate(-12 43 58)"
        />
        <circle cx="70" cy="86" r="10.5" fill="#6b4416" />
        <ellipse cx="70" cy="82.5" rx="7.5" ry="4" fill="#4e300d" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 150 140" width={size} aria-label="꿀샘 벌집 (Lv.4)">
      {defs}
      <ellipse cx="75" cy="70" rx="64" ry="58" fill="#ffd97a" opacity="0.22" />
      <circle cx="75" cy="16" r="6" fill="none" stroke="#c88a1c" strokeWidth="3.5" />
      <rect x="51" y="20" width="48" height="20" rx="10" fill={`url(#${bandB})`} />
      <rect x="38" y="34" width="74" height="22" rx="11" fill={`url(#${bandA})`} />
      <rect x="30" y="50" width="90" height="24" rx="12" fill={`url(#${bandB})`} />
      <rect x="34" y="68" width="82" height="23" rx="11.5" fill={`url(#${bandA})`} />
      <rect x="44" y="85" width="62" height="21" rx="10.5" fill={`url(#${bandB})`} />
      <rect x="42" y="33" width="66" height="4" rx="2" fill="#c47f12" opacity="0.26" />
      <rect x="34" y="49" width="82" height="4" rx="2" fill="#c47f12" opacity="0.26" />
      <rect x="38" y="67" width="74" height="4" rx="2" fill="#c47f12" opacity="0.26" />
      <rect x="48" y="84" width="54" height="4" rx="2" fill="#c47f12" opacity="0.26" />
      <ellipse
        cx="52"
        cy="44"
        rx="13"
        ry="6.5"
        fill="#fff"
        opacity="0.42"
        transform="rotate(-14 52 44)"
      />
      <path
        d="M46 56 c0 7 -3 9 -3 13.5 a3 3 0 0 0 6 0 C49 65 46 63 46 56z"
        fill={`url(#${honey})`}
      />
      <path
        d="M104 40 c0 6 -2.6 8 -2.6 12 a2.8 2.8 0 0 0 5.6 0 C107 48 104 46 104 40z"
        fill={`url(#${honey})`}
      />
      <circle cx="75" cy="90" r="10.5" fill="#6b4416" />
      <path
        d="M75 100 c0 5 -3.2 6.8 -3.2 10.2 a3.2 3.2 0 0 0 6.4 0 C78.2 106.8 75 105 75 100z"
        fill={`url(#${honey})`}
      />
      <path
        d="M28 30 l1.6 4.4 4.4 1.6 -4.4 1.6 -1.6 4.4 -1.6 -4.4 -4.4 -1.6 4.4 -1.6z"
        fill="#ffcf5e"
      />
      <path
        d="M126 62 l1.3 3.6 3.6 1.3 -3.6 1.3 -1.3 3.6 -1.3 -3.6 -3.6 -1.3 3.6 -1.3z"
        fill="#ffcf5e"
      />
      <path d="M120 20 l1 2.8 2.8 1 -2.8 1 -1 2.8 -1 -2.8 -2.8 -1 2.8 -1z" fill="#ffdd85" />
    </svg>
  )
}
