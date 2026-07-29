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

export interface SignupResponse {
  id: number
  loginId: string
  nickname: string
  profileImageUrl: string | null
}

export interface AuthUser {
  loginId: string
  nickname: string
  profileImageUrl: string | null
  userId?: number | null
}

export interface MyProfileResponse {
  userId: number
  loginId: string
  nickname: string
  profileImageUrl: string | null
}
