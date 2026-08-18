'use client'

import { useState } from 'react'
import { getErrorMessage } from '@/lib/apiError'
import { compressImageFile } from '@/lib/imageCompression'
import { getPresignedUploadUrl, uploadFileToStorage } from '@/services/fileService'
import type { PresignedUploadRequest } from '@/types/file.types'

interface UsePresignedUploadOptions {
  type: PresignedUploadRequest['type']
  token?: string
  /** 로그인 전 회원가입 단계에서만 쓴다. 자세한 배경은 `PresignedUploadRequest.signupToken` 참조. */
  signupToken?: string
}

interface UsePresignedUploadReturn {
  upload: (file: File) => Promise<string>
  isUploading: boolean
  error: string | null
}

export function usePresignedUpload({
  type,
  token,
  signupToken,
}: UsePresignedUploadOptions): UsePresignedUploadReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function upload(file: File): Promise<string> {
    setError(null)
    setIsUploading(true)
    try {
      const uploadFile = await compressImageFile(file)
      const { uploadUrl, objectKey } = await getPresignedUploadUrl(
        {
          type,
          fileName: uploadFile.name,
          contentType: uploadFile.type,
          fileSize: uploadFile.size,
          signupToken,
        },
        token
      )
      await uploadFileToStorage(uploadUrl, uploadFile)
      return objectKey
    } catch (err) {
      const message = getErrorMessage(err, '파일 업로드에 실패했습니다.')
      setError(message)
      throw new Error(message)
    } finally {
      setIsUploading(false)
    }
  }

  return { upload, isUploading, error }
}
