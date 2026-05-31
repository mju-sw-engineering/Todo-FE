import { deleteJson, getJson, patchJson, postJson } from '@/lib/apiClient'
import { invalidateCache } from '@/lib/requestCache'
import type { MyInfoResponse } from '@/types/user.types'

export async function getMyInfo(token: string): Promise<MyInfoResponse> {
  return getJson<MyInfoResponse>('/api/users/me', token)
}

export async function updateNickname(nickname: string, token: string): Promise<MyInfoResponse> {
  return patchJson<MyInfoResponse>('/api/users/me/nickname', { nickname }, token)
}

export async function logoutApi(token: string): Promise<void> {
  return postJson<void>('/api/auth/logout', {}, token)
}

export async function deleteAccount(token: string): Promise<void> {
  return deleteJson<void>('/api/users/me', token)
}

export async function leaveTeam(teamId: number, token: string): Promise<void> {
  const result = await deleteJson<void>(`/api/teams/${teamId}/leave`, token)
  invalidateCache('teams')
  return result
}
