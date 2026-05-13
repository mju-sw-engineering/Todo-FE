'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
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
    setTeamImage(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!teamName.trim()) {
      setError('팀 이름을 입력해주세요')
      return
    }
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
      const team = await createTeam({ teamName: teamName.trim(), teamImageKey }, token)
      router.push(`/teams?created=1&teamId=${team.teamId}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '팀 생성 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-white px-6 py-10 animate-fade-up md:flex-none md:rounded-[28px] md:border md:border-border md:shadow-[0_8px_40px_rgba(91,79,207,0.10)] md:px-9 md:py-11">
      <h1 className="text-[22px] font-bold text-ink text-center mb-8">팀 생성하기</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="teamName"
            className="text-[13px] font-semibold text-primary tracking-wide"
          >
            팀 이름
          </label>
          <input
            id="teamName"
            type="text"
            value={teamName}
            onChange={(e) => {
              setTeamName(e.target.value)
              if (error) setError('')
            }}
            placeholder="팀 이름을 입력해주세요"
            className="w-full px-4 py-3.25 rounded-[14px] border-[1.5px] border-border bg-white text-[14px] text-ink placeholder:text-muted placeholder:font-light outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_4px_rgba(91,79,207,0.10)]"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-semibold text-primary tracking-wide">
            팀 이미지
            <span className="text-[12px] font-normal text-muted">(선택)</span>
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 rounded-[14px] border-[1.5px] border-border bg-white flex items-center justify-center overflow-hidden transition-all duration-200 hover:border-primary hover:bg-primary-light"
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
                className="w-7 h-7 text-muted"
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

        <button
          type="submit"
          disabled={isLoading || isUploading}
          className="w-full py-3.75 mt-4 bg-primary text-white text-[15px] font-semibold rounded-[14px] shadow-[0_4px_18px_rgba(91,79,207,0.22)] transition-all duration-200 hover:bg-primary-hover hover:-translate-y-px hover:shadow-[0_8px_28px_rgba(91,79,207,0.28)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {isUploading ? '이미지 업로드 중...' : isLoading ? '생성 중...' : '완료'}
        </button>
      </form>

      <button
        onClick={() => router.back()}
        className="w-full text-center mt-4 text-[14px] font-medium text-muted hover:text-primary transition-colors duration-200"
      >
        돌아가기
      </button>
    </div>
  )
}
