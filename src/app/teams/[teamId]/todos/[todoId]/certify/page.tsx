'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { ApiError } from '@/lib/apiClient'
import { compressImageFile } from '@/lib/imageCompression'
import { getPresignedUploadUrl, uploadFileToStorage } from '@/services/fileService'
import { submitTodo } from '@/services/todoService'
import { useAuth } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/PageLoader'

function CertifyContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const teamId = Number(params.teamId)
  const todoId = Number(params.todoId)
  const { token } = useAuth()

  const title = searchParams.get('title') ?? '할 일'

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (preview) URL.revokeObjectURL(preview)
    setFile(selected)
    setError('')
    setPreview(URL.createObjectURL(selected))
    e.target.value = ''
  }

  async function handleSubmit() {
    if (!file || !token) return
    setError('')
    setIsSubmitting(true)
    try {
      const uploadFile = await compressImageFile(file)
      const { uploadUrl, objectKey } = await getPresignedUploadUrl(
        { type: 'PROOF', fileName: uploadFile.name, contentType: uploadFile.type },
        token
      )
      await uploadFileToStorage(uploadUrl, uploadFile)
      await submitTodo(todoId, { proofImageKey: objectKey }, token)
      router.replace(
        `/teams/${teamId}/todos/${todoId}?certified=1&myStatus=${encodeURIComponent('완료')}`
      )
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : '인증샷 업로드에 실패했습니다. 다시 시도해주세요.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-white animate-fade-up">
      <input
        id="certify-camera"
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleFileChange}
      />
      <input
        id="certify-gallery"
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
      />

      <div className="px-6 pt-8 pb-4">
        <button
          onClick={() => router.back()}
          className="text-[13px] font-semibold text-muted mb-6 flex items-center gap-1 hover:text-gray-700 transition-colors"
        >
          ← 인증샷 업로드
        </button>
        <h1 className="text-[20px] font-bold text-ink mb-1 leading-snug">{title}</h1>
        <p className="text-[13px] text-muted">인증 사진을 업로드해 주세요</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4 flex flex-col gap-3 min-h-0">
        <label
          htmlFor="certify-gallery"
          className="w-full rounded-[18px] bg-gray-50 overflow-hidden flex items-center justify-center cursor-pointer shrink-0"
          style={{ height: '52vw', minHeight: '200px', maxHeight: '320px' }}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="인증샷 미리보기"
              className="w-full h-full object-contain"
              decoding="async"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-gray-300">
                <rect
                  x="2"
                  y="6"
                  width="24"
                  height="18"
                  rx="3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle cx="14" cy="15" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M10 6l1.5-3h5L18 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-[13px] text-gray-300 select-none">사진을 선택하거나 촬영하세요</p>
            </div>
          )}
        </label>

        <div className="grid grid-cols-2 gap-3 shrink-0">
          <label
            htmlFor="certify-camera"
            className="py-3.5 rounded-[14px] border border-border text-[14px] font-semibold text-ink text-center cursor-pointer transition-all duration-200 hover:border-gray-900 hover:text-gray-900"
          >
            카메라
          </label>
          <label
            htmlFor="certify-gallery"
            className="py-3.5 rounded-[14px] border border-border text-[14px] font-semibold text-ink text-center cursor-pointer transition-all duration-200 hover:border-gray-900 hover:text-gray-900"
          >
            갤러리
          </label>
        </div>

        {error && (
          <p className="text-[13px] text-red-400 bg-red-50 rounded-[10px] px-4 py-2.5 shrink-0">
            {error}
          </p>
        )}
      </div>

      <div className="px-6 py-5 border-t border-border">
        <Button onClick={handleSubmit} disabled={!file || isSubmitting}>
          {isSubmitting ? '업로드 중...' : '제출하기'}
        </Button>
      </div>
    </div>
  )
}

export default function CertifyPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <CertifyContent />
    </Suspense>
  )
}
