'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { putFileWithProgress } from '@/lib/apiClient'
import { compressImageFile } from '@/lib/imageCompression'
import { getProofUploadContentType, isProofImageFile } from '@/lib/proofFile'
import { getPresignedUploadUrl } from '@/services/fileService'

export type BackgroundUploadStatus = 'idle' | 'uploading' | 'done' | 'error'

interface UploadResult {
  objectKey: string
  /** 압축 전 원본 파일명. 제출 API의 proofFileName으로 보낸다. */
  originalFileName: string
}

interface UseBackgroundProofUploadReturn {
  status: BackgroundUploadStatus
  /** 0~100. uploading일 때만 의미 있다. */
  progress: number
  /** 파일 선택 즉시 호출한다. 진행 중이던 업로드는 중단하고 새로 시작한다. */
  start: (file: File) => void
  /** 파일 제거 시 호출한다. 진행 중이던 업로드를 중단한다. */
  cancel: () => void
  /**
   * 제출 시점에 호출한다. 업로드가 아직 진행 중이면 끝날 때까지 기다리고,
   * 이미 끝났으면 즉시 반환한다. 실패했던 업로드는 여기서 처음부터 다시 시도한다 —
   * 제출 버튼이 곧 재시도 버튼이라 사용자가 실패를 따로 수습할 필요가 없다.
   */
  waitForResult: () => Promise<UploadResult>
}

/**
 * 인증 파일을 제출 버튼과 분리해 파일 선택 즉시 백그라운드로 올린다.
 *
 * <p>업로드(수 초)가 사용자가 미리보기를 확인하는 시간과 겹치므로, 제출 버튼을 누를
 * 때는 대부분 이미 끝나 있다. 제출 대기가 체감에서 사라지는 것이 목적이고, 업로드
 * 자체가 빨라지는 것은 아니다.
 *
 * <p>제출 없이 페이지를 떠나면 올라간 파일은 고아로 남는데, 서버의 고아 파일 정리
 * 스케줄러(presign 발급 원장 기반)가 유예 시간 후 청소한다.
 */
export function useBackgroundProofUpload(todoId: number, token: string | undefined) {
  const [status, setStatus] = useState<BackgroundUploadStatus>('idle')
  const [progress, setProgress] = useState(0)

  // 제출 시점에 필요한 것은 최신 업로드의 Promise 하나뿐이라 상태가 아니라 ref로 둔다.
  // 어떤 파일의 업로드인지는 Promise가 스스로 알고 있어 file 상태와 어긋날 수 없다.
  const currentUpload = useRef<{
    promise: Promise<UploadResult>
    controller: AbortController
    file: File
  } | null>(null)

  const runUpload = useCallback(
    (file: File): Promise<UploadResult> => {
      const controller = new AbortController()
      setStatus('uploading')
      setProgress(0)

      const promise = (async (): Promise<UploadResult> => {
        if (!token) throw new Error('로그인이 필요합니다.')
        const uploadFile = isProofImageFile(file) ? await compressImageFile(file) : file
        if (controller.signal.aborted) {
          throw new DOMException('업로드가 중단되었습니다.', 'AbortError')
        }
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
        await putFileWithProgress(uploadUrl, uploadFile, {
          signal: controller.signal,
          onProgress: (percent) => {
            // 다른 파일로 교체된 뒤 도착하는 이전 업로드의 진행 이벤트는 무시한다
            if (currentUpload.current?.controller === controller) {
              setProgress(percent)
            }
          },
        })
        return { objectKey, originalFileName: file.name }
      })()

      currentUpload.current = { promise, controller, file }

      promise.then(
        () => {
          if (currentUpload.current?.controller === controller) setStatus('done')
        },
        () => {
          // 중단(교체·제거)은 실패가 아니다. 새 업로드가 이미 상태를 넘겨받았다.
          if (currentUpload.current?.controller === controller) setStatus('error')
        }
      )
      return promise
    },
    [todoId, token]
  )

  const start = useCallback(
    (file: File) => {
      currentUpload.current?.controller.abort()
      runUpload(file)
    },
    [runUpload]
  )

  const cancel = useCallback(() => {
    currentUpload.current?.controller.abort()
    currentUpload.current = null
    setStatus('idle')
    setProgress(0)
  }, [])

  const waitForResult = useCallback(async (): Promise<UploadResult> => {
    const upload = currentUpload.current
    if (!upload) throw new Error('업로드할 파일이 없습니다.')
    try {
      return await upload.promise
    } catch {
      // 실패했던 업로드는 제출 시점에 같은 파일로 처음부터 다시 시도한다
      return runUpload(upload.file)
    }
  }, [runUpload])

  // 페이지를 떠나면 진행 중인 업로드를 중단한다. 이미 올라간 파일은 서버 청소 대상이다.
  useEffect(() => {
    return () => currentUpload.current?.controller.abort()
  }, [])

  return { status, progress, start, cancel, waitForResult } satisfies UseBackgroundProofUploadReturn
}
