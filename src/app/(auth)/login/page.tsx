'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AuthButton } from '@/components/ui/AuthButton'
import { AuthInput } from '@/components/ui/AuthInput'
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
    <div className="flex-1 flex flex-col bg-white animate-fade-up">
      {/* 상단 그라데이션 장식 */}
      <div
        className="w-full pt-14 pb-10 px-6 text-center"
        style={{ background: 'linear-gradient(160deg, #FFF0F6 0%, #FFF8F2 60%, #F5FBFF 100%)' }}
      >
        <div className="flex items-center justify-center gap-1 mb-3">
          <span className="text-3xl">✅</span>
        </div>
        <h1 className="text-[36px] font-black text-ink tracking-tight leading-none mb-2">
          Todo<span className="text-primary">Team</span>
        </h1>
        <p className="text-[13.5px] text-muted">팀과 함께 완성하는 하루</p>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-8 pb-12">
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
          className="block text-center mt-auto pt-8 text-[14px] font-medium text-ink hover:text-primary transition-colors duration-200"
        >
          회원가입
        </Link>
      </div>
    </div>
  )
}
