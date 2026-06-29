'use client'

interface PageHeaderProps {
  title: string
  subtitle?: string
  onBack?: () => void
}

export function PageHeader({ title, subtitle, onBack }: PageHeaderProps) {
  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors shrink-0"
            aria-label="뒤로가기"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-[20px] font-black text-ink leading-tight">{title}</h1>
          {subtitle && <p className="text-[12px] text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}
