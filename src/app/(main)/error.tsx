'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MainError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-[15px] font-medium text-gray-700">페이지 이동 중 문제가 발생했습니다.</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 text-[13px] font-semibold text-white bg-gray-900 rounded-xl"
        >
          다시 시도
        </button>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 text-[13px] font-semibold text-gray-700 border border-gray-200 rounded-xl"
        >
          홈으로
        </button>
      </div>
    </div>
  )
}
