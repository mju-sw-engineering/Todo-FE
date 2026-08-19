import { deleteJson, getJson, patchJson, postJson } from '@/lib/apiClient'
import type { MyInfoResponse, UpdatePasswordRequest } from '@/types/user.types'

export async function getMyInfo(token: string): Promise<MyInfoResponse> {
  return getJson<MyInfoResponse>('/api/users/me', token)
}

export async function updateNickname(nickname: string, token: string): Promise<MyInfoResponse> {
  return patchJson<MyInfoResponse>('/api/users/me/nickname', { nickname }, token)
}

/** presigned-upload로 올린 이미지의 objectKey를 프로필 사진으로 반영한다 */
export async function updateProfileImage(
  profileImageKey: string,
  token: string
): Promise<MyInfoResponse> {
  return patchJson<MyInfoResponse>('/api/users/me/profile-image', { profileImageKey }, token)
}

/** LOCAL 계정만 가능 — 애플 계정은 400으로 거절된다 */
export async function updatePassword(request: UpdatePasswordRequest, token: string): Promise<void> {
  return patchJson<void>('/api/users/me/password', request, token)
}

export async function logoutApi(token: string): Promise<void> {
  return postJson<void>('/api/auth/logout', {}, token)
}

export async function deleteAccount(reauthToken: string, token: string): Promise<void> {
  return deleteJson<void>('/api/users/me', token, { reauthToken })
}
