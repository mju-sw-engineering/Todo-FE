import Image from 'next/image'

export type BeeExpression = 'default' | 'focus' | 'happy' | 'cheer' | 'proud' | 'sad'

/* 원본 viewBox 819×728 비율 */
const ASPECT = 728 / 819

interface BeeCharacterProps {
  expression?: BeeExpression
  /** 렌더 너비(px). 높이는 비율에 맞춰 자동 계산 */
  size?: number
  /** true면 좌우 반전 — 벌이 오른쪽(콘텐츠 방향)을 보게 할 때 사용 */
  flip?: boolean
  className?: string
}

/** 완료율(0~100)에 맞는 표정. 할 일이 없는 날은 proud(휴식)를 쓴다. */
export function expressionForProgress(pct: number, total: number): BeeExpression {
  if (total === 0) return 'proud'
  if (pct === 100) return 'cheer'
  if (pct >= 75) return 'happy'
  if (pct >= 25) return 'focus'
  return 'default'
}

export function BeeCharacter({
  expression = 'default',
  size = 96,
  flip = false,
  className = '',
}: BeeCharacterProps) {
  return (
    <Image
      src={`/images/bee/${expression}.svg`}
      alt=""
      width={size}
      height={Math.round(size * ASPECT)}
      className={[flip ? 'scale-x-[-1]' : '', className].filter(Boolean).join(' ')}
      priority={false}
    />
  )
}
