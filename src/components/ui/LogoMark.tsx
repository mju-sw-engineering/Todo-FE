import Image from 'next/image'

interface LogoMarkProps {
  /** 렌더 크기(px). 정사각형 */
  size?: number
  className?: string
}

/**
 * 두비두비 앱 로고. 로그인 벌을 정면·플랫로 단순화한 마크로,
 * 파비콘·iOS/Android 앱 아이콘과 같은 원본(scripts/logo-source.mjs)에서 나온다.
 */
export function LogoMark({ size = 32, className = '' }: LogoMarkProps) {
  return (
    <Image
      src="/icon.svg"
      alt="두비두비"
      width={size}
      height={size}
      priority
      className={className}
    />
  )
}
