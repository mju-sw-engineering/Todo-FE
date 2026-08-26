'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { BeePose } from '@/components/bee/BeePose'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { usePresignedUpload } from '@/hooks/usePresignedUpload'
import { createTeam } from '@/services/teamService'
import { useAuth } from '@/store/authStore'

export default function TeamNewPage() {
  const router = useRouter()
  const { token } = useAuth()

  const [teamName, setTeamName] = useState('')
  const [description, setDescription] = useState('')
  const [teamImage, setTeamImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { isLoading, setError, run } = useAsyncTask()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { upload, isUploading } = usePresignedUpload({ type: 'TEAM', token: token ?? undefined })

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setTeamImage(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleSubmit(e: { preventDefault(): void }) {
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

    await run(
      async () => {
        let teamImageKey: string | null = null
        if (teamImage) teamImageKey = await upload(teamImage)
        const team = await createTeam(
          { teamName: teamName.trim(), description: description.trim() || null, teamImageKey },
          token
        )
        router.push(`/teams?created=1&teamId=${team.teamId}`)
      },
      { fallback: '팀 생성 중 오류가 발생했습니다.' }
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-fade-up">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <BackButton onClick={() => router.back()} />
          <div className="min-w-0">
            <h1 className="text-[20px] font-black text-ink leading-tight">팀 생성하기</h1>
            <p className="text-[12px] text-muted mt-0.5">팀 정보를 입력해 주세요</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <form id="team-new-form" onSubmit={handleSubmit} className="flex min-h-full flex-col gap-6">
          <Input
            id="teamName"
            label="팀 이름"
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="팀 이름을 입력해주세요"
          />

          <Input
            id="teamDescription"
            label="팀 설명 (선택)"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="팀을 한 줄로 소개해 주세요"
            maxLength={100}
          />

          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-gray-700 tracking-wide">
              팀 이미지 (선택)
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-20 h-20 rounded-[14px] border-2 border-dashed border-border bg-gray-50 flex items-center justify-center overflow-hidden transition-all duration-200 hover:border-gray-400 hover:bg-gray-100"
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
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
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

          <div className="mt-auto flex flex-col items-center gap-2 pt-6 pb-2">
            <BeePose pose="flower" size={72} decorative />
            <p className="text-[12.5px] text-muted text-center">
              멋진 이름으로 우리 벌집을 열어보세요
            </p>
          </div>
        </form>
      </div>

      <div className="px-6 py-5 border-t border-border flex flex-col gap-3">
        <Button type="submit" form="team-new-form" size="lg" disabled={isLoading || isUploading}>
          {isUploading ? '이미지 업로드 중...' : isLoading ? '생성 중...' : '완료'}
        </Button>
        <Button variant="secondary" size="lg" onClick={() => router.back()}>
          돌아가기
        </Button>
      </div>
    </div>
  )
}
