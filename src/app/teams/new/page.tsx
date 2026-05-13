'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { AuthButton } from '@/components/ui/AuthButton'
import { AuthInput } from '@/components/ui/AuthInput'
import { usePresignedUpload } from '@/hooks/usePresignedUpload'
import { ApiError } from '@/lib/apiClient'
import { createTeam } from '@/services/teamService'
import { useAuth } from '@/store/authStore'

export default function TeamNewPage() {
  const router = useRouter()
  const { token } = useAuth()

  const [teamName, setTeamName] = useState('')
  const [teamImage, setTeamImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { upload, isUploading } = usePresignedUpload({ type: 'TEAM', token: token ?? undefined })

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setTeamImage(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    if (!token) {
      setError('로그인이 필요합니다.')
      return
    }

    setIsLoading(true)
    try {
      let teamImageKey: string | null = null
      if (teamImage) {
        teamImageKey = await upload(teamImage)
      }
      const team = await createTeam({ teamName, teamImageKey }, token)
      router.push(`/teams/${team.id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '팀 생성 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white rounded-[28px] border border-border shadow-[0_8px_40px_rgba(91,79,207,0.10)] px-9 pt-11 pb-11">
        <div className="text-center mb-9">
          <h1 className="text-[26px] font-bold text-ink tracking-tight">팀 만들기</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <AuthInput
            id="teamName"
            label="팀 이름"
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="팀 이름을 입력해 주세요"
            required
          />

          <div>
            <p className="text-[13px] font-semibold text-primary tracking-wide mb-2.5">
              팀 이미지 <span className="text-[12px] font-normal text-muted">선택</span>
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-20.5 h-20.5 rounded-2xl border-2 border-dashed border-border bg-input-bg flex items-center justify-center overflow-hidden transition-all duration-200 hover:border-primary hover:bg-primary-light"
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="팀 이미지 미리보기"
                  className="w-full h-full object-cover"
                />
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
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-50 rounded-xl px-3.5 py-2.5">{error}</p>
          )}

          <AuthButton disabled={isLoading || isUploading}>
            {isUploading ? '이미지 업로드 중...' : isLoading ? '팀 생성 중...' : '팀 만들기'}
          </AuthButton>
        </form>

        <button
          onClick={() => router.back()}
          className="block w-full text-center mt-8 text-[14px] font-medium text-ink hover:text-primary transition-colors duration-200"
        >
          돌아가기
        </button>
      </div>
    </div>
  )
}
