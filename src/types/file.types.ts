export interface PresignedUploadRequest {
  type: 'PROFILE' | 'TEAM'
  fileName: string
  contentType: string
}

export interface PresignedUploadResponse {
  uploadUrl: string
  objectKey: string
}
