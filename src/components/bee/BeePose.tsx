import Image from 'next/image'

/**
 * 상황별 벌 일러스트. 로그인 벌과 같은 캐릭터이며 소품·표정으로 상황을 구분한다.
 * 에셋은 scripts/generate-home-bees.mjs 가 로그인 벌에서 생성한다.
 */
export type BeePoseName = 'plain' | 'cheer' | 'search' | 'flower'

/* 포즈마다 기울기·소품이 달라 viewBox 비율이 다르다 (높이 / 너비) */
const ASPECT: Record<BeePoseName, number> = {
  plain: 913 / 869,
  cheer: 1050 / 844,
  search: 964 / 903,
  flower: 929 / 972,
}

const ALT: Record<BeePoseName, string> = {
  plain: '두비두비 꿀벌',
  cheer: '할 일을 모두 끝내고 환호하는 꿀벌',
  search: '돋보기를 들고 살펴보는 꿀벌',
  flower: '꽃을 든 꿀벌',
}

interface BeePoseProps {
  pose: BeePoseName
  /** 렌더 너비(px). 높이는 포즈 비율에 맞춰 자동 계산 */
  size?: number
  /** true면 좌우 반전 — 벌이 오른쪽(콘텐츠 방향)을 보게 할 때 사용 */
  flip?: boolean
  /** 장식용이라 읽어줄 필요가 없을 때 (예: 문구가 이미 상황을 설명하는 자리) */
  decorative?: boolean
  className?: string
}

export function BeePose({
  pose,
  size = 96,
  flip = false,
  decorative = false,
  className = '',
}: BeePoseProps) {
  return (
    <Image
      src={`/images/bee/bee-${pose}.svg`}
      alt={decorative ? '' : ALT[pose]}
      width={size}
      height={Math.round(size * ASPECT[pose])}
      className={[flip ? 'scale-x-[-1]' : '', className].filter(Boolean).join(' ')}
      priority={false}
    />
  )
}
