'use client'

import { useEffect, useRef, useState } from 'react'

const ALLOWED_TYPES = ['image/jpeg', 'image/png']

interface ProfileImagePickerProps {
  /** 검증을 통과한 파일. 형식이 맞지 않으면 호출되지 않는다 */
  onSelect: (file: File) => void
  onError: (message: string) => void
  /** 사진을 안 고르면 기본 아바타가 쓰인다는 안내를 띄울지 */
  showFallbackHint?: boolean
}

/**
 * 가입 시 프로필 사진 선택.
 *
 * 이메일 가입과 애플 가입이 같은 UI를 쓰므로 공용으로 뺐다. 업로드 자체는 호출부가
 * `usePresignedUpload`로 처리한다 — 이 컴포넌트는 파일 고르기와 미리보기만 담당한다.
 *
 * 미리보기 URL은 여기서 소유한다. 호출부가 들고 있으면 사진을 바꿀 때마다 이전 blob이
 * 해제되지 않고 쌓이는 실수를 화면마다 반복하게 된다.
 */
export function ProfileImagePicker({
  onSelect,
  onError,
  showFallbackHint = false,
}: ProfileImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // 언마운트 시 마지막 blob을 해제한다. previewUrl을 의존성에 넣으면 교체될 때마다
  // 정리가 돌아 방금 만든 URL까지 즉시 해제되므로 ref로 최신 값만 따라간다.
  const previewUrlRef = useRef<string | null>(null)
  useEffect(() => {
    previewUrlRef.current = previewUrl
  }, [previewUrl])
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) {
      onError('jpg, png 형식의 이미지만 업로드할 수 있습니다.')
      e.target.value = ''
      return
    }
    setPreviewUrl((prev) => {
      // 사진을 여러 번 바꾸면 이전 blob이 그대로 남는다.
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    onSelect(file)
  }

  return (
    <div>
      <p className="text-[13px] font-semibold text-gray-700 tracking-wide mb-2.5">
        프로필 사진 <span className="text-[12px] font-normal text-muted">선택</span>
      </p>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-20 h-20 rounded-2xl border-2 border-dashed border-border bg-gray-50 flex items-center justify-center overflow-hidden transition-all duration-200 hover:border-gray-400 hover:bg-gray-100 relative"
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="프로필 미리보기" className="w-full h-full object-cover" />
        ) : (
          <svg
            className="w-6 h-6 text-muted"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        )}
      </button>
      {!previewUrl && showFallbackHint && (
        <p className="text-[11px] text-gray-400 mt-1.5">기본 아바타가 사용됩니다</p>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
