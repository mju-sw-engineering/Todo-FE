import Image from 'next/image'

interface BeeAvatarProps {
  /** public/images/bee 안의 파일명 (경로 없이) */
  src?: string
  size?: number
  className?: string
}

/** 꿀벌 캐릭터 이미지를 원형 프로필로 감싼다 — 봇 아바타 등에 쓴다 */
export function BeeAvatar({ src = '인사하는꿀벌.png', size = 32, className = '' }: BeeAvatarProps) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-point-light ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={`/images/bee/${src}`}
        alt=""
        fill
        unoptimized
        className="object-contain p-[12%]"
      />
    </div>
  )
}
