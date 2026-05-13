import { postJson, putFile } from '@/lib/apiClient'
import type { PresignedUploadRequest, PresignedUploadResponse } from '@/types/file.types'

export async function getPresignedUploadUrl(
  request: PresignedUploadRequest,
  token?: string
): Promise<PresignedUploadResponse> {
  return postJson<PresignedUploadResponse>('/api/files/presigned-upload', request, token)
}

export async function uploadFileToStorage(uploadUrl: string, file: File): Promise<void> {
  return putFile(uploadUrl, file)
}
