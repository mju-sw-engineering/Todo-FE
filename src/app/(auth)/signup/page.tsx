'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { AuthButton } from '@/components/ui/AuthButton'
import { AuthInput } from '@/components/ui/AuthInput'
import { usePresignedUpload } from '@/hooks/usePresignedUpload'
import { ApiError } from '@/lib/apiClient'
import { signup } from '@/services/authService'

const ALLOWED_TYPES = ['image/jpeg', 'image/png']

export default function SignupPage() {
  const router = useRouter()

  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [nickname, setNickname] = useState('')
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { upload, isUploading } = usePresignedUpload({ type: 'PROFILE' })

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('jpg, png 형식의 이미지만 업로드할 수 있습니다.')
      e.target.value = ''
      return
    }
    setError('')
    setProfileImage(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    if (password.length < 6) return setError('비밀번호는 6자 이상이어야 합니다.')
    if (password !== passwordConfirm) return setError('비밀번호가 일치하지 않습니다.')

    setIsLoading(true)
    try {
      let profileImageKey: string | null = null
      if (profileImage) {
        profileImageKey = await upload(profileImage)
      }
      await signup({ loginId, password, passwordConfirm, nickname, profileImageKey })
      router.push('/login?registered=1')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '회원가입 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const passwordMismatch = passwordConfirm.length > 0 && password !== passwordConfirm
  const passwordTooShort = password.length > 0 && password.length < 6

  return (
    <div className="flex-1 flex flex-col bg-white px-6 py-12 animate-fade-up">
      <div className="text-center mb-9">
        <h1 className="text-[26px] font-bold text-ink tracking-tight">회원가입</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <AuthInput
          id="loginId"
          label="이메일"
          type="email"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          placeholder="이메일을 입력해 주세요"
          required
        />
        <AuthInput
          id="password"
          label="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="6자 이상 입력해 주세요"
          required
          hint={passwordTooShort ? '비밀번호는 6자 이상이어야 합니다.' : undefined}
        />
        <AuthInput
          id="passwordConfirm"
          label="비밀번호 확인"
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          placeholder="비밀번호를 다시 입력해 주세요"
          required
          hint={passwordMismatch ? '비밀번호가 일치하지 않습니다.' : undefined}
        />
        <AuthInput
          id="nickname"
          label="닉네임"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임을 입력해 주세요"
          required
        />

        <div>
          <p className="text-[13px] font-semibold text-primary tracking-wide mb-2.5">
            프로필 사진 <span className="text-[12px] font-normal text-muted">선택</span>
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-20.5 h-20.5 rounded-2xl border-2 border-dashed border-border bg-input-bg flex items-center justify-center overflow-hidden transition-all duration-200 hover:border-primary hover:bg-primary-light"
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-50 rounded-xl px-3.5 py-2.5">{error}</p>
        )}

        <AuthButton disabled={isLoading || isUploading}>
          {isUploading ? '이미지 업로드 중...' : isLoading ? '가입 중...' : '완료'}
        </AuthButton>
      </form>

      <Link
        href="/login"
        className="block text-center mt-auto pt-8 text-[14px] font-medium text-ink hover:text-primary transition-colors duration-200"
      >
        로그인으로 돌아가기
      </Link>
    </div>
  )
}
