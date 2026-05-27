import type { TodoStatus } from '@/types/todo.types'

export function TodoStatusBadge({ status }: { status: TodoStatus }) {
  if (status === 'IN_PROGRESS') {
    return (
      <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-500">
        <span className="relative flex w-1.5 h-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
          <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-blue-400" />
        </span>
        진행중
      </span>
    )
  }

  if (status === 'SUCCESS') {
    return (
      <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="shrink-0">
          <path
            d="M2 5.5L4.5 8L9 3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        성공
      </span>
    )
  }

  return (
    <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-400">
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="shrink-0">
        <rect x="2.5" y="5" width="6" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <path
          d="M4 5V3.5a1.5 1.5 0 0 1 3 0V5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
      마감
    </span>
  )
}
