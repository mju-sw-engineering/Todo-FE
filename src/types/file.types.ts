export interface PresignedUploadRequest {
  type: 'PROFILE' | 'TEAM' | 'PROOF'
  fileName: string
  contentType: string
}

export interface PresignedUploadResponse {
  uploadUrl: string
  objectKey: string
}
