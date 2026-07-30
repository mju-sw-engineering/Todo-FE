interface BackButtonProps {
  onClick?: () => void
  className?: string
}

export function BackButton({ onClick, className = '' }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className={['p-1.5 rounded-full hover:bg-gray-100 transition-colors shrink-0', className]
        .filter(Boolean)
        .join(' ')}
      aria-label="뒤로가기"
    >
      <svg
        className="w-5 h-5 text-muted"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  )
}
