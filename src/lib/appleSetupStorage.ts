/**
 * 애플 로그인 1단계와 2단계 사이에 setup token을 넘긴다.
 *
 * URL 쿼리로 넘기지 않는 이유는 토큰이 브라우저 방문 기록과 리퍼러에 남기 때문이다.
 * 5분짜리 단명 토큰이라 sessionStorage면 충분하고, 탭을 닫으면 같이 사라진다.
 */
const KEY = 'appleSetup'

export interface AppleSetup {
  setupToken: string
  /** 애플이 최초 1회 준 이름. 닉네임 입력란 기본값으로만 쓴다 */
  suggestedNickname: string | null
}

export function saveAppleSetup(setup: AppleSetup): void {
  sessionStorage.setItem(KEY, JSON.stringify(setup))
}

export function readAppleSetup(): AppleSetup | null {
  const raw = sessionStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AppleSetup
  } catch {
    sessionStorage.removeItem(KEY)
    return null
  }
}

export function clearAppleSetup(): void {
  sessionStorage.removeItem(KEY)
}
