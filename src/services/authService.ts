import { getJson, postJson } from '@/lib/apiClient'
import type {
  EmailVerificationSendRequest,
  EmailVerificationVerifyRequest,
  EmailVerificationVerifyResponse,
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

export async function getMyProfile(token: string): Promise<MyProfileResponse> {
  return getJson<MyProfileResponse>('/api/users/me', token)
}

export async function reauthenticate(
  request: ReauthRequest,
  token: string
): Promise<ReauthResponse> {
  return postJson<ReauthResponse>('/api/auth/reauth', request, token)
}
