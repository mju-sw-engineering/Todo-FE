/**
 * apiClient와 인증 스토어를 잇는 다리.
 *
 * apiClient는 React 밖의 모듈이라 스토어를 직접 못 읽는다. 그렇다고 401 처리를 각 훅에
 * 흩어놓으면 모든 호출부가 같은 재시도 코드를 갖게 되므로, 스토어가 자기 접근자를
 * 여기 등록하고 apiClient가 그것만 사용한다.
 *
 * 등록은 AuthProvider가 마운트될 때 한 번 한다.
 */
export interface AuthBridge {
  /** 현재 액세스 토큰. 없으면 null */
  getToken: () => string | null
  /** 갱신된 토큰을 스토어와 localStorage에 반영한다 */
  onTokenRefreshed: (token: string) => void
  /** 갱신까지 실패해 재로그인이 필요한 상태 */
  onAuthExpired: () => void
}

let bridge: AuthBridge | null = null

export function registerAuthBridge(next: AuthBridge): () => void {
  bridge = next
  return () => {
    if (bridge === next) bridge = null
  }
}

export function getAuthBridge(): AuthBridge | null {
  return bridge
}
