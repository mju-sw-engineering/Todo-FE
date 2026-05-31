'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { AuthInput } from '@/components/ui/AuthInput'
import { usePresignedUpload } from '@/hooks/usePresignedUpload'
import { useVoice } from '@/hooks/useVoice'
import { ApiError } from '@/lib/apiClient'
import { createTeam } from '@/services/teamService'
import { useAuth } from '@/store/authStore'
import type { AiPersona } from '@/types/team.types'
import { AngelBlob, DevilBlob } from '@/components/ui/BlobCharacter'

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
            <span className="text-[13px] font-semibold text-gray-700 tracking-wide">
              팀 이미지 (선택)
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-20 h-20 rounded-[14px] border-2 border-dashed border-border bg-input-bg flex items-center justify-center overflow-hidden transition-all duration-200 hover:border-gray-400 hover:bg-gray-50"
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
            <span className="text-[13px] font-semibold text-gray-700 tracking-wide">
              팀 가이드 AI 선택
            </span>
            <div className="flex flex-col gap-3">
              {(
                [
                  {
                    persona: 'DEVIL' as AiPersona,
                    name: '악마 AI',
                    tagline: '엄격한 채찍 멘토',
                    desc: '게으름은 절대 용납 불가. 목표를 향해 가차 없이 몰아붙여요.',
                    bg: 'linear-gradient(135deg, #2D0A1A 0%, #4A1030 55%, #3D0A20 100%)',
                    ring: 'ring-gray-900',
                    isLight: false,
                  },
                  {
                    persona: 'ANGEL' as AiPersona,
                    name: '천사 AI',
                    tagline: '따뜻한 응원 멘토',
                    desc: '칭찬과 격려로 함께 성장해요. 작은 노력도 놓치지 않아요.',
                    bg: 'linear-gradient(135deg, #FFF8FC 0%, #FFE8F4 55%, #FFF0F9 100%)',
                    ring: 'ring-gray-900',
                    isLight: true,
                  },
                ] as const
              ).map(({ persona, name, tagline, desc, bg, ring, isLight }) => {
                const selected = aiPersona === persona
                const isVoicePlaying = voice.isPlaying && voice.activePersona === persona
                const isVoiceLoading = voice.isLoading && voice.activePersona === persona
                return (
                  <div
                    key={persona}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setAiPersona(persona)
                      if (error === 'AI 페르소나를 선택해주세요') setError('')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setAiPersona(persona)
                        if (error === 'AI 페르소나를 선택해주세요') setError('')
                      }
                    }}
                    className={`relative w-full rounded-2xl overflow-hidden transition-all duration-200 ring-offset-2 cursor-pointer ${
                      selected
                        ? `ring-2 ${ring} scale-[1.015] shadow-[0_8px_28px_rgba(0,0,0,0.12)]`
                        : 'shadow-sm hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]'
                    }`}
                    style={{ background: bg }}
                  >
                    <div className="flex items-center gap-3 px-4 py-4">
                      {/* Blob character */}
                      <div className="shrink-0 animate-blob-float">
                        {persona === 'DEVIL' ? <DevilBlob size={72} /> : <AngelBlob size={72} />}
                      </div>

                      {/* Text */}
                      <div className="flex-1 text-left min-w-0">
                        <p
                          className={`text-[17px] font-black leading-tight ${isLight ? 'text-ink' : 'text-white'}`}
                        >
                          {name}
                        </p>
                        <p
                          className={`text-[12px] font-semibold mt-0.5 ${isLight ? 'text-gray-500' : 'text-[#FFAAC8]'}`}
                        >
                          {tagline}
                        </p>
                        <p
                          className={`text-[11px] leading-relaxed mt-1.5 ${isLight ? 'text-muted' : 'text-white/60'}`}
                        >
                          {desc}
                        </p>
                      </div>

                      {/* Right: check + play */}
                      <div className="flex flex-col items-center gap-2 shrink-0">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                            selected
                              ? 'bg-white border-transparent shadow-sm'
                              : 'border-white/40 bg-transparent'
                          }`}
                        >
                          {selected && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path
                                d="M2 6l3 3 5-5"
                                stroke="#111"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            voice.toggle({ persona, isSample: true })
                          }}
                          disabled={voice.isLoading && !isVoiceLoading}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-150 active:scale-90 disabled:opacity-40"
                          style={{
                            background: isVoicePlaying
                              ? isLight
                                ? '#111'
                                : 'rgba(255,255,255,0.25)'
                              : isLight
                                ? 'rgba(0,0,0,0.07)'
                                : 'rgba(255,255,255,0.12)',
                            color: isVoicePlaying ? 'white' : isLight ? '#333' : 'white',
                          }}
                        >
                          {isVoiceLoading ? (
                            <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                          ) : isVoicePlaying ? (
                            <>
                              <svg width="9" height="9" viewBox="0 0 9 9" fill="currentColor">
                                <rect x="0.5" y="0.5" width="2.5" height="8" rx="1" />
                                <rect x="6" y="0.5" width="2.5" height="8" rx="1" />
                              </svg>
                              정지
                            </>
                          ) : (
                            <>
                              <svg width="9" height="9" viewBox="0 0 9 9" fill="currentColor">
                                <path d="M1.5 1l6.5 3.5-6.5 3.5V1z" />
                              </svg>
                              듣기
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
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
          className="w-full py-3.75 bg-gray-900 text-white text-[15px] font-semibold rounded-[14px] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(0,0,0,0.18)]"
        >
          {isUploading ? '이미지 업로드 중...' : isLoading ? '생성 중...' : '완료'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full py-3.75 bg-gray-100 text-gray-700 text-[15px] font-semibold rounded-[14px] transition-all duration-200 hover:bg-gray-200"
        >
          돌아가기
        </button>
      </div>
    </div>
  )
}
