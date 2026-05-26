'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AuthButton } from '@/components/ui/AuthButton'
import { AuthInput } from '@/components/ui/AuthInput'
import { ApiError } from '@/lib/apiClient'
import { login } from '@/services/authService'
import { useAuth } from '@/store/authStore'

interface JwtPayload {
  sub?: string
  nickname?: string
  memberId?: number
  userId?: number
  id?: number
}

function decodeJwt(token: string): JwtPayload {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return {}
  }
}

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
      const jwt = decodeJwt(accessToken)
      const nickname = jwt.nickname ?? loginId
      const userId = jwt.memberId ?? jwt.userId ?? jwt.id ?? null
      setAuth(accessToken, { loginId, nickname, profileImageUrl: null, userId })
      router.push('/')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '로그인 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-white px-6 py-12 animate-fade-up">
      <div className="text-center mb-10">
        <h1 className="text-[36px] font-bold text-ink tracking-tight leading-none mb-2.5">
          Todo<span className="text-primary">Team</span>
        </h1>
        <p className="text-[13.5px] text-muted">팀과 함께 완성하는 하루</p>
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
  )
}
