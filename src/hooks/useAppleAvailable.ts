'use client'

import { useSyncExternalStore } from 'react'
import { isAppleSignInAvailable } from '@/lib/appleAuth'

/** 플랫폼은 런타임 중 바뀌지 않으므로 구독할 것이 없다. */
function subscribe(): () => void {
  return () => {}
}

/**
 * 애플 로그인을 쓸 수 있는 환경인지.
 *
 * 서버 렌더에서는 Capacitor가 언제나 'web'이라 그대로 판별하면 하이드레이션이 어긋난다.
 * `useEffect`로 미루면 첫 프레임을 잘못 그렸다가 뒤집혀 로그인 폼이 깜빡인다.
 * `useSyncExternalStore`는 서버/클라이언트 스냅샷을 나눠 한 번에 확정해 둘 다 피한다.
 */
export function useAppleAvailable(): boolean {
  return useSyncExternalStore(subscribe, isAppleSignInAvailable, () => false)
}
