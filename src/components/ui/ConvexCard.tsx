import type { ReactNode } from 'react'

interface ConvexCardProps {
  children: ReactNode
  bg: string
  className?: string
  onClick?: () => void
}

/** 그라데이션·블러·쉐도우 없이 팔레트 색을 그대로 보여주는 플랫 카드 */
export function ConvexCard({ children, bg, className = '', onClick }: ConvexCardProps) {
  return (
    <div
      onClick={onClick}
      className={`relative w-full rounded-[22px] overflow-hidden transition-all duration-150 ${className}`}
      style={{ background: bg }}
    >
      <div className="relative px-5 py-5 flex flex-col gap-3">{children}</div>
    </div>
  )
}
