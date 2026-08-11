import { SignInWithApple } from '@capacitor-community/apple-sign-in'
import { Capacitor } from '@capacitor/core'

/**
 * 애플 로그인의 네이티브 자격 증명 획득.
 *
 * 이 앱은 `capacitor.config.ts`의 `server.url`로 배포된 웹을 웹뷰에 띄운다. 즉 같은 번들이
 * 브라우저와 iOS 앱에서 동시에 돌아가므로, 애플 로그인을 부르기 전에 반드시 플랫폼을 확인해야 한다.
 *
 * 플러그인의 웹 폴백은 Apple CDN 스크립트를 받아 Services ID(`clientId`)로 OAuth 팝업을 띄운다.
 * 앱스토어 배포만 하는 지금은 Services ID를 발급하지 않았으므로 그 경로는 반드시 막아야 한다.
 * 게이팅 없이 부르면 브라우저에서 정체불명의 애플 팝업이 뜨고 실패한다.
 */

/** iOS 네이티브 앱에서만 애플 로그인을 지원한다. 브라우저·Android는 false. */
export function isAppleSignInAvailable(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios'
}

/** 사용자가 애플 시트를 직접 닫은 경우. 에러 메시지를 보여주면 안 된다. */
export class AppleSignInCancelledError extends Error {
  constructor() {
    super('사용자가 애플 로그인을 취소했습니다.')
    this.name = 'AppleSignInCancelledError'
  }
}

export interface AppleCredential {
  /** 백엔드가 검증할 JWT. `aud`는 bundle ID(`org.bluerack.todo`) */
  identityToken: string
  authorizationCode: string
  /** 원본 nonce. 토큰의 `nonce` 클레임은 이 값의 SHA-256 hex다 */
  nonce: string
  /**
   * 애플은 이름을 **최초 인증 1회만** 준다. 재로그인 시에는 null이다.
   *
   * 백엔드는 이 값을 받지 않는다(socialId만 쓴다). 신규 가입 시 닉네임 입력란의
   * 기본값을 채우는 용도로만 쓴다.
   */
  fullName: string | null
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/** 재생 공격 방지용 원본 nonce. 이 값이 백엔드로 간다. */
function createRawNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return toHex(bytes)
}

/**
 * 애플에 넘길 nonce는 원본의 SHA-256 hex다.
 *
 * iOS 네이티브는 우리가 넘긴 문자열을 그대로 identity token의 `nonce` 클레임에 넣는다.
 * 백엔드(`AppleIdentityTokenService.validateNonce`)는 요청으로 받은 원본을 SHA-256 hex로
 * 해싱해 그 클레임과 비교하므로, 애플에는 해시를, 백엔드에는 원본을 보내야 한다.
 * 둘을 바꿔 보내면 401로 떨어진다.
 *
 * `crypto.subtle`은 보안 컨텍스트에서만 존재한다. 운영(https)과 시뮬레이터(localhost)는
 * 해당되지만, 실기기를 LAN IP의 평문 http dev 서버에 붙이면 없다. 그 경우는 조용히 실패하는
 * 대신 명확히 알려준다.
 */
async function sha256Hex(value: string): Promise<string> {
  if (!crypto.subtle) {
    throw new Error(
      '애플 로그인은 https 또는 localhost에서만 가능합니다. 실기기 테스트는 배포본을 이용해 주세요.'
    )
  }
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return toHex(new Uint8Array(digest))
}

/** ASAuthorizationError.canceled */
const CANCELLED_ERROR_CODE = '1001'

function toFullName(givenName: string | null, familyName: string | null): string | null {
  // 애플은 한국어 이름도 given/family로 쪼개 주지만 표시 순서는 지역에 따라 다르다.
  // 백엔드가 닉네임 기본값으로만 쓰므로 여기서는 성 + 이름 순으로 합친다.
  const joined = [familyName, givenName].filter(Boolean).join('')
  return joined || null
}

/**
 * 애플 로그인 시트를 띄우고 자격 증명을 받아온다.
 *
 * 호출 전에 `isAppleSignInAvailable()`로 확인해야 한다. 취소는
 * `AppleSignInCancelledError`로 구분해 던지므로 호출부가 조용히 무시할 수 있다.
 */
export async function requestAppleCredential(): Promise<AppleCredential> {
  if (!isAppleSignInAvailable()) {
    throw new Error('애플 로그인은 iOS 앱에서만 사용할 수 있습니다.')
  }

  const nonce = createRawNonce()
  const hashedNonce = await sha256Hex(nonce)

  try {
    const { response } = await SignInWithApple.authorize({
      // clientId·redirectURI는 iOS 네이티브에서 무시된다(웹 폴백 전용). 타입이 필수로
      // 요구하므로 문서 목적으로 실제 값을 넣어둔다.
      clientId: 'org.bluerack.todo',
      redirectURI: 'https://todo.bluerack.org/login',
      scopes: 'email name',
      nonce: hashedNonce,
    })

    return {
      identityToken: response.identityToken,
      authorizationCode: response.authorizationCode,
      nonce,
      fullName: toFullName(response.givenName ?? null, response.familyName ?? null),
    }
  } catch (e) {
    // 플러그인이 ASAuthorizationError를 localizedDescription 문자열로만 넘겨준다.
    // 취소는 에러가 아니라 정상 흐름이므로 코드로 걸러낸다.
    const message = e instanceof Error ? e.message : String(e)
    if (message.includes(CANCELLED_ERROR_CODE)) {
      throw new AppleSignInCancelledError()
    }
    throw new Error('애플 로그인에 실패했습니다.')
  }
}
