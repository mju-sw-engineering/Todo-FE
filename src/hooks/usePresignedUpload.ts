'use client'

import { useState } from 'react'
import { ApiError } from '@/lib/apiClient'
import { getPresignedUploadUrl, uploadFileToStorage } from '@/services/fileService'

interface UsePresignedUploadOptions {
  type: 'PROFILE' | 'TEAM'
  token?: string
}

interface UsePresignedUploadReturn {
  upload: (file: File) => Promise<string>
  isUploading: boolean
  error: string | null
}

export function usePresignedUpload({
  type,
  token,
}: UsePresignedUploadOptions): UsePresignedUploadReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function upload(file: File): Promise<string> {
    setError(null)
    setIsUploading(true)
    try {
      const { uploadUrl, objectKey } = await getPresignedUploadUrl(
        { type, fileName: file.name, contentType: file.type },
        token
      )
      await uploadFileToStorage(uploadUrl, file)
      return objectKey
    } catch (err) {
      const message = err instanceof ApiError ? err.message : '파일 업로드에 실패했습니다.'
      setError(message)
      throw new Error(message)
    } finally {
      setIsUploading(false)
    }
  }

  return { upload, isUploading, error }
}
