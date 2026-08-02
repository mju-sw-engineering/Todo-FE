'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useRef, useState } from 'react'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { compressImageFile } from '@/lib/imageCompression'
import { getPresignedUploadUrl, uploadFileToStorage } from '@/services/fileService'
import { submitTodo, submitTodoWorkItem } from '@/services/todoService'
import { useAuth } from '@/store/authStore'
import { AddImgButton } from '@/components/ui/AddImgButton'
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
  const mode = searchParams.get('mode')
  const workItemId = Number(searchParams.get('workItemId'))

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const { isLoading: isSubmitting, error, setError, run } = useAsyncTask()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (preview) URL.revokeObjectURL(preview)
    setFile(selected)
    setError(null)
    setPreview(URL.createObjectURL(selected))
    e.target.value = ''
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
        const uploadFile = await compressImageFile(file)
        const { uploadUrl, objectKey } = await getPresignedUploadUrl(
          { type: 'PROOF', fileName: uploadFile.name, contentType: uploadFile.type },
          token
        )
        await uploadFileToStorage(uploadUrl, uploadFile)
        if (mode === 'TASK') {
          if (!workItemId) throw new Error('Task 정보를 확인할 수 없습니다.')
          await submitTodoWorkItem(workItemId, { proofImageKey: objectKey }, token)
        } else {
          await submitTodo(todoId, { proofImageKey: objectKey }, token)
        }
        router.replace(`/teams/${teamId}/todos/${todoId}?certified=1`)
      },
      { fallback: '인증샷 업로드에 실패했습니다. 다시 시도해주세요.' }
    )
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
        ref={galleryInputRef}
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
        <AddImgButton
          imageUrl={preview}
          onAddClick={() => galleryInputRef.current?.click()}
          onRemove={handleRemove}
          className="shrink-0"
          style={{ height: '52vw', minHeight: '200px', maxHeight: '320px' }}
        />

        <div className="grid grid-cols-2 gap-3 shrink-0">
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
          <p className="text-[13px] text-status-red bg-status-red/10 rounded-[10px] px-4 py-2.5 shrink-0">
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
