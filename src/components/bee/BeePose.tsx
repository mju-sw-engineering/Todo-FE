import Image from 'next/image'

/**
 * 상황별 벌 일러스트. 로그인 벌과 같은 캐릭터이며 소품·표정으로 상황을 구분한다.
 * 에셋은 scripts/generate-home-bees.mjs 가 로그인 벌에서 생성한다.
 */
export type BeePoseName = 'cheer' | 'search' | 'flower'

/* 포즈마다 소품 위치가 달라 viewBox 비율이 다르다 (높이 / 너비) */
const ASPECT: Record<BeePoseName, number> = {
  cheer: 983 / 878,
  search: 888 / 940,
  flower: 806 / 1004,
}

const ALT: Record<BeePoseName, string> = {
  cheer: '할 일을 모두 끝내고 환호하는 꿀벌',
  search: '돋보기를 들고 살펴보는 꿀벌',
  flower: '꽃을 든 꿀벌',
}

interface BeePoseProps {
  pose: BeePoseName
  /** 렌더 너비(px). 높이는 포즈 비율에 맞춰 자동 계산 */
  size?: number
  className?: string
}

export function BeePose({ pose, size = 96, className = '' }: BeePoseProps) {
  return (
    <Image
      src={`/images/bee/bee-${pose}.svg`}
      alt={ALT[pose]}
      width={size}
      height={Math.round(size * ASPECT[pose])}
      className={className}
      priority={false}
    />
  )
}
