'use client'

interface AddTodoCardProps {
  label?: string
  onClick: () => void
}

/**
 * 리스트 맨 끝에 카드처럼 놓이는 추가 버튼.
 * 떠 있는 FAB과 달리 레이아웃 흐름 안에 있어서 어떤 카드도 가리지 않는다.
 */
export function AddTodoCard({ label = '할 일 추가', onClick }: AddTodoCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-[22px] border-[1.5px] border-dashed border-neutral-40 bg-white py-4 flex items-center justify-center gap-1.5 text-[13.5px] font-bold text-muted transition-all duration-150 hover:border-primary hover:text-primary hover:bg-primary-light active:scale-[0.99]"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.4}
      >
        <path strokeLinecap="round" d="M12 5v14M5 12h14" />
      </svg>
      {label}
    </button>
  )
}
