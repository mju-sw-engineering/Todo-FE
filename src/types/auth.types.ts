export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string | null
}

export interface LoginRequest {
  loginId: string
  password: string
}

export interface SignupRequest {
  email: string
  emailVerificationToken: string
  loginId: string
  password: string
  passwordConfirm: string
  nickname: string
  profileImageKey?: string | null
  termsAgreed: boolean
  privacyAgreed: boolean
  marketingAgreed: boolean
}

export interface EmailVerificationSendRequest {
  email: string
}

export interface EmailVerificationVerifyRequest {
  email: string
  code: string
}

export interface EmailVerificationVerifyResponse {
  emailVerificationToken: string
}

export interface LoginResponse {
  accessToken: string
}

/**
 * 애플 로그인 1단계 요청.
 *
 * `nonce`는 원본 값이다. 백엔드가 이 값을 SHA-256 hex로 해싱해 identity token의
 * `nonce` 클레임과 대조한다.
 */
export interface AppleLoginRequest {
  identityToken: string
  authorizationCode: string
  nonce: string
}

/**
 * 애플 로그인 1단계 응답.
 *
 * 기존 회원이면 바로 로그인되어 `accessToken`이, 처음 보는 애플 계정이면 닉네임을 받아야 해서
 * `setupToken`(5분 유효)이 온다. HTTP 상태는 각각 200/202지만 `apiClient`가 상태를 넘겨주지
 * 않으므로 응답 형태로 구분한다.
 */
export type AppleLoginResponse = { accessToken: string } | { setupToken: string }

/**
 * 애플 신규 가입 2단계.
 *
 * 이메일은 백엔드가 1단계 identity token에서 뽑아 setup token에 담아두므로 보내지 않는다.
 * 필수 약관 두 가지는 서버의 `@AssertTrue`가 강제하므로 false로 보내면 400이다.
 */
export interface AppleCompleteRequest {
  setupToken: string
  nickname: string
  profileImageKey: string | null
  termsAgreed: boolean
  privacyAgreed: boolean
  marketingAgreed: boolean
}

/** 애플 계정 재인증 — 비밀번호가 없어 애플 시트를 다시 통과했다는 증거를 보낸다. */
export interface AppleReauthRequest {
  identityToken: string
  nonce: string
  purpose: 'WITHDRAWAL'
}

export interface AppleCompleteResponse {
  accessToken: string
}

export interface ReauthRequest {
  password: string
  purpose: 'WITHDRAWAL'
}

export interface ReauthResponse {
  reauthToken: string
  expiresAt: string
}

export interface SignupResponse {
  id: number
  loginId: string
  nickname: string
  profileImageUrl: string | null
}

/** 가입 경로. 탈퇴 재인증 방식이 이 값에 따라 갈린다. */
export type AuthProvider = 'LOCAL' | 'APPLE'

export interface AuthUser {
  /** 애플로 가입한 계정은 아이디/비밀번호가 없어 null이다 */
  loginId: string | null
  nickname: string
  profileImageUrl: string | null
  userId?: number | null
}

export interface MyProfileResponse {
  userId: number
  /** 애플 계정은 null */
  loginId: string | null
  nickname: string
  profileImageUrl: string | null
  provider: AuthProvider
}
