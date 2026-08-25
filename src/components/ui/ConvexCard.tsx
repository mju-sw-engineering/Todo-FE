import type { ReactNode } from 'react'

interface ConvexCardProps {
  children: ReactNode
  bg: string
  className?: string
  /** 목록에서 여러 장이 연달아 쌓일 때 쓰는 좁은 여백 */
  dense?: boolean
  onClick?: () => void
}

/** 그라데이션·블러·쉐도우 없이 팔레트 색을 그대로 보여주는 플랫 카드 */
export function ConvexCard({
  children,
  bg,
  className = '',
  dense = false,
  onClick,
}: ConvexCardProps) {
  return (
    <div
      onClick={onClick}
      className={`relative w-full shrink-0 rounded-[22px] overflow-hidden transition-all duration-150 ${className}`}
      style={{ background: bg }}
    >
      <div className={`relative flex flex-col ${dense ? 'px-4 py-3.5 gap-2' : 'px-5 py-5 gap-3'}`}>
        {children}
      </div>
    </div>
  )
}
