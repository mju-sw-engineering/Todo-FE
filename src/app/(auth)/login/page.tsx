'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { getMyProfile, login } from '@/services/authService'
import { useAuth } from '@/store/authStore'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuth()

  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const { isLoading, error, run } = useAsyncTask()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    await run(
      async () => {
        const { accessToken } = await login({ loginId, password })
        const profile = await getMyProfile(accessToken)
        setAuth(accessToken, {
          loginId,
          nickname: profile.nickname,
          profileImageUrl: profile.profileImageUrl,
          userId: profile.userId,
        })
        router.push('/')
      },
      { fallback: '로그인 중 오류가 발생했습니다.' }
    )
  }

  return (
    <div
      className="flex-1 flex flex-col animate-fade-up overflow-hidden"
      style={{ background: 'linear-gradient(155deg, #FFE4F2 0%, #FFF8E6 40%, #E8F3FF 100%)' }}
    >
      {/* 타이틀 */}
      <div className="flex-1 flex flex-col justify-end px-6 pb-10">
        <h1 className="text-[40px] font-black text-gray-900 tracking-tight leading-none">
          TodoTeam
        </h1>
        <p className="text-[13px] text-gray-500 font-medium mt-2">팀과 함께 완성하는 하루</p>
      </div>

      {/* 폼 바텀 시트 */}
      <div className="bg-white rounded-t-4xl shadow-[0_-6px_32px_rgba(0,0,0,0.10)] px-6 pt-7 pb-10 flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <Input
            id="loginId"
            label="이메일"
            type="email"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="이메일을 입력해 주세요"
            required
          />
          <Input
            id="password"
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력해 주세요"
            required
          />

          {error && (
            <p className="text-[13px] text-red-400 bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <Button type="submit" size="lg" disabled={isLoading} className="mt-1">
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <p className="text-center text-[13px] text-gray-400">
          계정이 없으신가요?{' '}
          <Link
            href="/signup"
            className="font-bold text-gray-900 hover:underline underline-offset-2"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
