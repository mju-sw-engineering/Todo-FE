'use client'

import { Capacitor } from '@capacitor/core'
import { useSyncExternalStore } from 'react'

/** 플랫폼은 런타임 중 바뀌지 않으므로 구독할 것이 없다. */
function subscribe(): () => void {
  return () => {}
}

/**
 * Capacitor 네이티브 앱(WebView)에서 실행 중인지.
 *
 * 서버 렌더에서는 Capacitor가 언제나 'web'이라 그대로 판별하면 하이드레이션이 어긋난다.
 * `useAppleAvailable`과 같은 이유로 `useSyncExternalStore`로 서버/클라이언트 스냅샷을 나눈다.
 */
export function useIsNativeApp(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => Capacitor.isNativePlatform(),
    () => false
  )
}
