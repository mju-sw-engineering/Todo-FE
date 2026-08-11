'use client'

import { useAppleAvailable } from '@/hooks/useAppleAvailable'

interface AppleLoginButtonProps {
  onClick: () => void
  disabled?: boolean
  label?: string
}

/**
 * Apple HIG를 따르는 로그인 버튼.
 *
 * 검정 배경 + 흰 로고, 지정 문구("Apple로 로그인"), 최소 44pt 높이는 심사 대상이므로
 * 임의로 바꾸면 리젝될 수 있다. 다른 소셜 버튼보다 작게 만들어도 안 된다.
 *
 * iOS 네이티브가 아니면 아무것도 렌더하지 않는다. 배포된 웹이 브라우저에서도 열리는데
 * 거기서는 애플 로그인을 지원하지 않기 때문이다(`appleAuth.ts` 참조).
 */
export function AppleLoginButton({
  onClick,
  disabled = false,
  label = 'Apple로 로그인',
}: AppleLoginButtonProps) {
  const isAvailable = useAppleAvailable()

  if (!isAvailable) return null

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full min-h-11 flex items-center justify-center gap-2 rounded-[14px] bg-black text-white font-semibold text-[15px] py-4 transition-all duration-200 hover:-translate-y-px active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="w-[18px] h-[18px] fill-current"
        // 로고 광학 중심이 텍스트 베이스라인보다 살짝 위로 보여서 1px 내린다.
        style={{ transform: 'translateY(-1px)' }}
      >
        <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.98-3.6-.98-1.66 0-2.25 1.01-3.63 1.01-1.4 0-2.4-1.25-3.36-2.58C4.5 18.6 3.6 15.9 3.6 13.36c0-4.2 2.74-6.44 5.43-6.44 1.43 0 2.62.94 3.52.94.85 0 2.18-1 3.81-1 .62 0 2.85.06 4.32 2.16-.13.08-2.55 1.49-2.55 4.44 0 3.43 3.05 4.65 3.09 4.66z" />
      </svg>
      {label}
    </button>
  )
}
