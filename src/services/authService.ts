import { getJson, postJson } from '@/lib/apiClient'
import type {
  AppleCompleteRequest,
  AppleCompleteResponse,
  AppleLoginRequest,
  AppleLoginResponse,
  AppleReauthRequest,
  EmailVerificationSendRequest,
  EmailVerificationVerifyRequest,
  EmailVerificationVerifyResponse,
  FindIdRequest,
  FindIdResponse,
  LoginRequest,
  LoginResponse,
  MyProfileResponse,
  ReauthRequest,
  ReauthResponse,
  SignupRequest,
  SignupResponse,
} from '@/types/auth.types'

export async function login(request: LoginRequest): Promise<LoginResponse> {
  return postJson<LoginResponse>('/api/auth/login', request)
}

/**
 * 애플 로그인 1단계. 기존 회원이면 `accessToken`, 신규면 `setupToken`이 온다.
 */
export async function loginWithApple(request: AppleLoginRequest): Promise<AppleLoginResponse> {
  return postJson<AppleLoginResponse>('/api/auth/apple/login', request)
}

/** 애플 로그인 2단계. 닉네임을 붙여 가입을 마치고 로그인까지 끝낸다. */
export async function completeAppleSignup(
  request: AppleCompleteRequest
): Promise<AppleCompleteResponse> {
  return postJson<AppleCompleteResponse>('/api/auth/apple/complete', request)
}

export async function sendEmailVerification(request: EmailVerificationSendRequest): Promise<void> {
  return postJson<void>('/api/auth/email/send', request)
}

export async function verifyEmailCode(
  request: EmailVerificationVerifyRequest
): Promise<EmailVerificationVerifyResponse> {
  return postJson<EmailVerificationVerifyResponse>('/api/auth/email/verify', request)
}

export async function signup(request: SignupRequest): Promise<SignupResponse> {
  return postJson<SignupResponse>('/api/auth/signup', request)
}

/** 이메일 인증 토큰으로 이메일 소유를 확인하고 가입된 로그인 아이디를 반환한다. LOCAL 계정만 가능 */
export async function findId(request: FindIdRequest): Promise<FindIdResponse> {
  return postJson<FindIdResponse>('/api/auth/find-id', request)
}

export async function getMyProfile(token: string): Promise<MyProfileResponse> {
  return getJson<MyProfileResponse>('/api/users/me', token)
}

export async function reauthenticate(
  request: ReauthRequest,
  token: string
): Promise<ReauthResponse> {
  return postJson<ReauthResponse>('/api/auth/reauth', request, token)
}

/**
 * 애플 계정 재인증.
 *
 * 비밀번호가 없어 `/api/auth/reauth`는 400으로 거절된다. 애플 시트를 새로 통과했다는
 * 증거를 보내야 하며, 발급되는 reauthToken은 비밀번호 경로와 동일하게 쓰인다.
 */
export async function reauthenticateWithApple(
  request: AppleReauthRequest,
  token: string
): Promise<ReauthResponse> {
  return postJson<ReauthResponse>('/api/auth/reauth/apple', request, token)
}
