import { postJson } from '@/lib/apiClient'
import type { LoginRequest, LoginResponse, SignupRequest, SignupResponse } from '@/types/auth.types'

export async function login(request: LoginRequest): Promise<LoginResponse> {
  return postJson<LoginResponse>('/api/auth/login', request)
}

export async function signup(request: SignupRequest): Promise<SignupResponse> {
  return postJson<SignupResponse>('/api/auth/signup', request)
}
