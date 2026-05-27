'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { AuthInput } from '@/components/ui/AuthInput'
import { usePresignedUpload } from '@/hooks/usePresignedUpload'
import { useVoice } from '@/hooks/useVoice'
import { ApiError } from '@/lib/apiClient'
import { createTeam } from '@/services/teamService'
import { useAuth } from '@/store/authStore'
import type { AiPersona } from '@/types/team.types'

export default function TeamNewPage() {
  const router = useRouter()
  const { token } = useAuth()

  const [teamName, setTeamName] = useState('')
  const [teamImage, setTeamImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [aiPersona, setAiPersona] = useState<AiPersona | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const voice = useVoice()

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
    if (!aiPersona) {
      setError('AI 페르소나를 선택해주세요')
      return
    }
    if (!token) {
      setError('로그인이 필요합니다.')
      return
    }

    setIsLoading(true)
    try {
      let teamImageKey: string | null = null
      if (teamImage) teamImageKey = await upload(teamImage)
      const team = await createTeam({ teamName: teamName.trim(), teamImageKey, aiPersona }, token)
      router.push(`/teams?created=1&teamId=${team.teamId}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '팀 생성 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white animate-fade-up">
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-[22px] font-bold text-ink text-center">팀 생성하기</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <form id="team-new-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
          <AuthInput
            id="teamName"
            label="팀 이름"
            type="text"
            value={teamName}
            onChange={(e) => {
              setTeamName(e.target.value)
              if (error) setError('')
            }}
            placeholder="팀 이름을 입력해주세요"
            hint={error === '팀 이름을 입력해주세요' ? error : undefined}
          />

          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-primary tracking-wide">
              팀 이미지 (선택)
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-20 h-20 rounded-[14px] border-2 border-dashed border-border bg-input-bg flex items-center justify-center overflow-hidden transition-all duration-200 hover:border-primary hover:bg-primary-light"
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

          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-primary tracking-wide">
              팀 가이드 AI 선택
            </span>
            <div className="rounded-[18px] border border-border bg-input-bg p-4 flex flex-col items-center gap-4">
              <p className="text-[12px] text-muted text-center">
                우리 팀과 함께 할 AI를 선택해 주세요
              </p>
              <div className="flex justify-center gap-8">
                {(['DEVIL', 'ANGEL'] as AiPersona[]).map((persona) => {
                  const isDevil = persona === 'DEVIL'
                  const selected = aiPersona === persona
                  return (
                    <div key={persona} className="flex flex-col items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setAiPersona(persona)
                          if (error === 'AI 페르소나를 선택해주세요') setError('')
                        }}
                        className={`flex flex-col items-center gap-2 p-2.5 rounded-2xl transition-all duration-200 ${
                          selected
                            ? isDevil
                              ? 'border-2 border-primary scale-105 bg-white shadow-[0_2px_12px_rgba(91,79,207,0.18)]'
                              : 'border-2 border-pink-400 scale-105 bg-white shadow-[0_2px_12px_rgba(236,72,153,0.18)]'
                            : 'border-2 border-transparent hover:border-border hover:bg-white/60'
                        }`}
                      >
                        <div className="relative w-25 h-25 rounded-full overflow-hidden">
                          <Image
                            src={isDevil ? '/images/devil.png' : '/images/angel.png'}
                            alt={isDevil ? '악마 AI' : '천사 AI'}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <span
                          className={`text-[12px] font-bold transition-colors ${
                            selected ? (isDevil ? 'text-primary' : 'text-pink-500') : 'text-muted'
                          }`}
                        >
                          {isDevil ? '악마 AI' : '천사 AI'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => voice.toggle({ persona, isSample: true })}
                        disabled={voice.isLoading && voice.activePersona !== persona}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 ${
                          voice.isPlaying && voice.activePersona === persona
                            ? isDevil
                              ? 'bg-primary text-white'
                              : 'bg-pink-400 text-white'
                            : isDevil
                              ? 'bg-primary-light text-primary hover:bg-primary hover:text-white'
                              : 'bg-pink-50 text-pink-500 hover:bg-pink-400 hover:text-white'
                        } disabled:opacity-40`}
                      >
                        {voice.isLoading && voice.activePersona === persona ? (
                          <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        ) : voice.isPlaying && voice.activePersona === persona ? (
                          <>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                              <rect x="1" y="1" width="3" height="8" rx="1" />
                              <rect x="6" y="1" width="3" height="8" rx="1" />
                            </svg>
                            정지
                          </>
                        ) : (
                          <>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                              <path d="M2 1.5l7 3.5-7 3.5V1.5z" />
                            </svg>
                            샘플 듣기
                          </>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
            {error === 'AI 페르소나를 선택해주세요' && (
              <p className="text-xs text-red-400">{error}</p>
            )}
          </div>

          {error &&
            error !== '팀 이름을 입력해주세요' &&
            error !== 'AI 페르소나를 선택해주세요' && (
              <p className="text-xs text-red-400 text-center">{error}</p>
            )}
        </form>
      </div>

      <div className="px-6 py-5 border-t border-border flex flex-col gap-3">
        <button
          type="submit"
          form="team-new-form"
          disabled={isLoading || isUploading}
          className="w-full py-3.75 bg-primary text-white text-[15px] font-semibold rounded-[14px] shadow-[0_4px_18px_rgba(91,79,207,0.22)] transition-all duration-200 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? '이미지 업로드 중...' : isLoading ? '생성 중...' : '완료'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full py-3.75 bg-primary-light text-primary text-[15px] font-semibold rounded-[14px] transition-all duration-200 hover:bg-[#e0daf8]"
        >
          돌아가기
        </button>
      </div>
    </div>
  )
}
