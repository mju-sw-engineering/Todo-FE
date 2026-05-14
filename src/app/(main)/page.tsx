export default function TodoPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center pb-16">
      <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mb-4">
        <svg
          className="w-7 h-7 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      </div>
      <p className="text-[15px] font-semibold text-ink">할 일 목록</p>
      <p className="text-[13px] text-muted mt-1">곧 업데이트될 예정이에요</p>
    </div>
  )
}
