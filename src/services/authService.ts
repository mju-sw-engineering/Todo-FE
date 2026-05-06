import { postForm, postJson } from '@/lib/apiClient'
import type { LoginRequest, LoginResponse, SignupRequest, SignupResponse } from '@/types/auth.types'

export async function login(request: LoginRequest): Promise<LoginResponse> {
  return postJson<LoginResponse>('/api/auth/login', request)
}

export async function signup(request: SignupRequest, profileImage?: File): Promise<SignupResponse> {
  const formData = new FormData()
  formData.append('loginId', request.loginId)
  formData.append('password', request.password)
  formData.append('passwordConfirm', request.passwordConfirm)
  formData.append('nickname', request.nickname)
  if (profileImage) {
    formData.append('profileImage', profileImage)
  }
  return postForm<SignupResponse>('/api/auth/signup', formData)
}
