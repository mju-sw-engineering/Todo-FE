'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AuthButton } from '@/components/ui/AuthButton'
import { AuthInput } from '@/components/ui/AuthInput'
import { AngelBlob, DevilBlob } from '@/components/ui/BlobCharacter'
import { ApiError } from '@/lib/apiClient'
import { getMyProfile, login } from '@/services/authService'
import { useAuth } from '@/store/authStore'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuth()

  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const { accessToken } = await login({ loginId, password })
      const profile = await getMyProfile(accessToken)
      setAuth(accessToken, {
        loginId,
        nickname: profile.nickname,
        profileImageUrl: profile.profileImageUrl,
        userId: profile.userId,
      })
      router.push('/')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '로그인 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-white animate-fade-up overflow-hidden">
      {/* Hero: bold characters */}
      <div
        className="relative flex flex-col items-center pt-14 pb-8 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(180deg,#FFF8FC 0%,#FFF0F8 60%,#ffffff 100%)' }}
      >
        {/* Sparkle accents */}
        <div
          className="absolute top-6 left-8 w-2.5 h-2.5 rounded-full bg-[#FFD84D] opacity-70 animate-blob-float"
          style={{ animationDelay: '0.2s' }}
        />
        <div
          className="absolute top-10 right-10 w-2 h-2 rounded-full bg-[#FFCDC8] opacity-80 animate-blob-float"
          style={{ animationDelay: '1.1s' }}
        />
        <div
          className="absolute bottom-12 left-6 w-3 h-3 rounded-full bg-[#C8F0D0] opacity-60 animate-blob-float"
          style={{ animationDelay: '0.7s' }}
        />
        <div
          className="absolute bottom-8 right-5 w-2 h-2 rounded-full bg-[#FFD6E8] opacity-75 animate-blob-float"
          style={{ animationDelay: '1.5s' }}
        />

        {/* Main characters side by side */}
        <div className="flex items-end justify-center gap-1 mb-5">
          <div className="animate-blob-float" style={{ animationDelay: '0.4s' }}>
            <DevilBlob size={100} />
          </div>
          <div className="animate-blob-float">
            <AngelBlob size={120} />
          </div>
        </div>

        <h1 className="text-[38px] font-black text-gray-900 tracking-tighter leading-none mb-1.5">
          TodoTeam
        </h1>
        <p className="text-[13.5px] text-gray-400 font-medium">팀과 함께 완성하는 하루</p>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col px-6 pt-7 pb-10">
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
            placeholder="비밀번호를 입력해 주세요"
            required
          />

          {error && (
            <p className="text-sm text-red-400 bg-red-50 rounded-xl px-3.5 py-2.5">{error}</p>
          )}

          <AuthButton disabled={isLoading}>{isLoading ? '로그인 중...' : '로그인'}</AuthButton>
        </form>

        <Link
          href="/signup"
          className="block text-center mt-auto pt-8 text-[14px] font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          회원가입
        </Link>
      </div>
    </div>
  )
}
