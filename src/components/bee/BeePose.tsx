import Image from 'next/image'

/**
 * 상황별 벌 일러스트. 로그인 벌과 같은 캐릭터이며 소품·표정으로 상황을 구분한다.
 * plain/cheer/flower는 scripts/generate-home-bees.mjs 가 로그인 벌에서 생성한 라인아트 SVG,
 * 나머지는 public/images/bee 에 직접 추가된 컬러 일러스트(PNG)다.
 */
export type BeePoseName =
  | 'plain'
  | 'cheer'
  | 'search'
  | 'flower'
  | 'wave'
  | 'confetti'
  | 'thumbsUp'
  | 'jump'
  | 'tearyWave'

const SRC: Record<BeePoseName, string> = {
  plain: '/images/bee/bee-plain.svg',
  cheer: '/images/bee/bee-cheer.svg',
  search: '/images/bee/돋보기들고있는꿀벌.png',
  flower: '/images/bee/bee-flower.svg',
  wave: '/images/bee/인사하는꿀벌.png',
  confetti: '/images/bee/컨페티꿀벌.png',
  thumbsUp: '/images/bee/최고꿀벌.png',
  jump: encodeURI('/images/bee/웃으면서 점프하는 꿀벌.png'),
  tearyWave: encodeURI('/images/bee/울면서 웃는꿀벌.png'),
}

/* 포즈마다 기울기·소품이 달라 원본 비율이 다르다 (높이 / 너비) */
const ASPECT: Record<BeePoseName, number> = {
  plain: 913 / 869,
  cheer: 1050 / 844,
  search: 252 / 235,
  flower: 929 / 972,
  wave: 478 / 445,
  confetti: 295 / 254,
  thumbsUp: 240 / 252,
  jump: 280 / 224,
  tearyWave: 230 / 201,
}

const ALT: Record<BeePoseName, string> = {
  plain: '두비두비 꿀벌',
  cheer: '할 일을 모두 끝내고 환호하는 꿀벌',
  search: '돋보기를 들고 살펴보는 꿀벌',
  flower: '꽃을 든 꿀벌',
  wave: '손 흔들며 인사하는 꿀벌',
  confetti: '색종이가 흩날리는 가운데 신나 하는 꿀벌',
  thumbsUp: '엄지를 치켜든 꿀벌',
  jump: '웃으며 점프하는 꿀벌',
  tearyWave: '눈물이 그렁그렁하지만 웃으며 손 흔드는 꿀벌',
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
      src={SRC[pose]}
      alt={decorative ? '' : ALT[pose]}
      width={size}
      height={Math.round(size * ASPECT[pose])}
      className={[flip ? 'scale-x-[-1]' : '', className].filter(Boolean).join(' ')}
      priority={false}
    />
  )
}
