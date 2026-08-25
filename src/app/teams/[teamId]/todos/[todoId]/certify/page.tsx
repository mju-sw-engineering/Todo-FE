'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useRef, useState } from 'react'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { compressImageFile } from '@/lib/imageCompression'
import {
  PROOF_FILE_ACCEPT,
  getProofUploadContentType,
  isHwpFile,
  isProofImageFile,
  validateProofFile,
} from '@/lib/proofFile'
import { getPresignedUploadUrl, uploadFileToStorage } from '@/services/fileService'
import { submitTodo, submitTodoWorkItem } from '@/services/todoService'
import { useAuth } from '@/store/authStore'
import { AddImgButton } from '@/components/ui/AddImgButton'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/PageLoader'
import { ProofFileCard } from './components/ProofFileCard'

function CertifyContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const teamId = Number(params.teamId)
  const todoId = Number(params.todoId)
  const { token } = useAuth()

  const title = searchParams.get('title') ?? '할 일'
  const mode = searchParams.get('mode')
  const workItemId = Number(searchParams.get('workItemId'))

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const { isLoading: isSubmitting, setError, run } = useAsyncTask()

  const isImageSelected = file ? isProofImageFile(file) : false
  const isHwpSelected = file ? isHwpFile(file) : false

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return
    e.target.value = ''

    const validationError = validateProofFile(selected)
    if (validationError) {
      setError(validationError)
      return
    }

    if (preview) URL.revokeObjectURL(preview)
    setFile(selected)
    setError(null)
    setPreview(isProofImageFile(selected) ? URL.createObjectURL(selected) : null)
  }

  function handleRemove() {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
  }

  async function handleSubmit() {
    if (!file || !token) return
    await run(
      async () => {
        const originalFileName = file.name
        const uploadFile = isProofImageFile(file) ? await compressImageFile(file) : file
        const { uploadUrl, objectKey } = await getPresignedUploadUrl(
          {
            type: 'PROOF',
            fileName: uploadFile.name,
            contentType: getProofUploadContentType(uploadFile),
            fileSize: uploadFile.size,
            todoId,
          },
          token
        )
        await uploadFileToStorage(uploadUrl, uploadFile)
        const request = { proofImageKey: objectKey, proofFileName: originalFileName }
        if (mode === 'TASK') {
          if (!workItemId) throw new Error('Task 정보를 확인할 수 없습니다.')
          await submitTodoWorkItem(workItemId, request, token)
        } else {
          await submitTodo(todoId, request, token)
        }
        router.replace(`/teams/${teamId}/todos/${todoId}?certified=1`)
      },
      { fallback: '인증샷 업로드에 실패했습니다. 다시 시도해주세요.' }
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-surface animate-fade-up">
      <input
        ref={galleryInputRef}
        id="certify-gallery"
        type="file"
        accept={PROOF_FILE_ACCEPT}
        className="sr-only"
        onChange={handleFileChange}
      />

      <div className="shrink-0 border-b border-border bg-white px-6 pt-8 pb-5">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-1 text-[13px] font-semibold text-muted transition-colors hover:text-gray-700"
        >
          ← 인증샷 업로드
        </button>
        <h1 className="mb-1 text-[20px] font-bold leading-snug text-ink">{title}</h1>
        <p className="text-[13px] text-muted">인증 사진 또는 파일을 업로드해 주세요</p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-6 py-5">
        {file && !isImageSelected ? (
          <ProofFileCard fileName={file.name} fileSize={file.size} onRemove={handleRemove} />
        ) : (
          <AddImgButton
            imageUrl={preview}
            onAddClick={() => galleryInputRef.current?.click()}
            onRemove={handleRemove}
            className="shrink-0 border-2 border-dashed border-border"
            style={{ height: '52vw', minHeight: '200px', maxHeight: '320px' }}
          />
        )}

        {!file && (
          <p className="-mt-1 text-center text-[12px] text-muted">
            사진, PDF, 문서 파일을 올릴 수 있어요
          </p>
        )}

        {file && (
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="self-center text-[12.5px] font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            다른 파일 선택
          </button>
        )}

        {isHwpSelected && (
          <p className="shrink-0 rounded-[10px] bg-white px-4 py-2.5 text-[12px] text-muted">
            한글 파일은 AI 요약이 지원되지 않아요. PDF로 저장해 올리면 요약해드려요.
          </p>
        )}
      </div>

      <div className="shrink-0 border-t border-border bg-white px-6 py-5">
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
