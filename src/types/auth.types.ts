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
  loginId: string
  password: string
  passwordConfirm: string
  nickname: string
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
}
