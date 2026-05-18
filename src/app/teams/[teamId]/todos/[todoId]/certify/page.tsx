'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { ApiError } from '@/lib/apiClient'
import { getPresignedUploadUrl, uploadFileToStorage } from '@/services/fileService'
import { submitTodo } from '@/services/todoService'
import { useAuth } from '@/store/authStore'

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
      const { uploadUrl, objectKey } = await getPresignedUploadUrl(
        { type: 'PROFILE', fileName: file.name, contentType: file.type },
        token
      )
      await uploadFileToStorage(uploadUrl, file)
      await submitTodo(todoId, { proofImageKey: objectKey }, token)
      router.replace(
        `/teams/${teamId}/todos/${todoId}?certified=1&myStatus=${encodeURIComponent('평가 대기중')}`
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
    <div className="flex-1 flex flex-col bg-white animate-fade-up md:flex-none md:rounded-[28px] md:border md:border-border md:shadow-[0_8px_40px_rgba(91,79,207,0.10)]">
      {/* label 방식: 브라우저 네이티브 파일 다이얼로그 트리거 (모바일 포함 100% 동작) */}
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

      {/* 헤더 (스크롤 고정) */}
      <div className="px-6 pt-8 pb-4 md:px-9">
        <button
          onClick={() => router.back()}
          className="text-[13px] font-semibold text-muted mb-6 flex items-center gap-1 hover:text-primary transition-colors"
        >
          ← 인증샷 업로드
        </button>
        <h1 className="text-[20px] font-bold text-ink mb-1 leading-snug">{title}</h1>
        <p className="text-[13px] text-muted">인증 사진을 업로드해 주세요</p>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 md:px-9 flex flex-col gap-4">
        {/* 미리보기 영역 — label로 갤러리 트리거 */}
        <label
          htmlFor="certify-gallery"
          className="w-full rounded-[18px] bg-primary-light overflow-hidden flex items-center justify-center cursor-pointer"
          style={{ minHeight: '220px', flex: '1' }}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="인증샷 미리보기"
              className="w-full h-full object-cover"
              style={{ minHeight: '220px' }}
            />
          ) : (
            <p className="text-[13px] text-primary/50 select-none">사진을 선택하거나 촬영하세요</p>
          )}
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label
            htmlFor="certify-camera"
            className="py-3.5 rounded-[14px] border border-border text-[14px] font-semibold text-ink text-center cursor-pointer transition-all duration-200 hover:border-primary hover:text-primary"
          >
            카메라
          </label>
          <label
            htmlFor="certify-gallery"
            className="py-3.5 rounded-[14px] border border-border text-[14px] font-semibold text-ink text-center cursor-pointer transition-all duration-200 hover:border-primary hover:text-primary"
          >
            갤러리
          </label>
        </div>

        {error && (
          <p className="text-[13px] text-red-400 bg-red-50 rounded-[10px] px-4 py-2.5">{error}</p>
        )}
      </div>

      {/* 바텀 버튼 (항상 고정) */}
      <div className="px-6 py-5 border-t border-border md:px-9">
        <button
          onClick={handleSubmit}
          disabled={!file || isSubmitting}
          className="w-full py-3.75 bg-primary text-white text-[15px] font-semibold rounded-[14px] shadow-[0_4px_18px_rgba(91,79,207,0.22)] transition-all duration-200 hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '업로드 중...' : '제출하기'}
        </button>
      </div>
    </div>
  )
}

export default function CertifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center bg-white md:rounded-[28px] md:border md:border-border md:shadow-[0_8px_40px_rgba(91,79,207,0.10)]">
          <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CertifyContent />
    </Suspense>
  )
}
