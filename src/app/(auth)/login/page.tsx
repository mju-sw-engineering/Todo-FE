'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AnimatedBee } from '@/components/bee/AnimatedBee'
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
      style={{
        background:
          'linear-gradient(155deg, var(--color-secondary-10) 0%, #fdf9f4 40%, #e8f1ff 100%)',
      }}
    >
      {/* 타이틀 + 벌 무리 */}
      <div className="flex-1 relative px-6 pb-10 flex flex-col justify-end overflow-hidden">
        <div className="hex-pattern absolute inset-0 opacity-50 pointer-events-none" />

        {/* 큰 벌: 타이틀을 바라봄 */}
        <div className="absolute right-4 bottom-36 w-[130px] bee-bob">
          <AnimatedBee expression="happy" ns="lb1" />
        </div>
        {/* 작은 벌: 화면 안쪽을 바라보게 반전 */}
        <div className="absolute left-5 top-24 w-16 bee-bob [animation-delay:0.6s]">
          <AnimatedBee expression="default" ns="lb2" className="scale-x-[-1] -rotate-10" />
        </div>
        {/* 아주 작은 벌 */}
        <div className="absolute right-24 top-14 w-11 bee-bob [animation-delay:1.1s]">
          <AnimatedBee expression="cheer" ns="lb3" className="rotate-9" />
        </div>

        <h1 className="relative text-[40px] font-jua text-gray-900 tracking-tight leading-none">
          두비두비
        </h1>
        <p className="relative text-[13px] text-gray-500 font-medium mt-2">
          팀과 함께 완성하는 하루
        </p>
      </div>

      {/* 폼 바텀 시트 */}
      <div className="bg-white rounded-t-4xl shadow-[0_-6px_32px_rgba(0,0,0,0.10)] px-6 pt-7 pb-10 flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <Input
            id="loginId"
            label="아이디"
            type="text"
            autoComplete="username"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="아이디를 입력해 주세요"
            required
          />
          <Input
            id="password"
            label="비밀번호"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력해 주세요"
            required
          />

          {error && (
            <p className="text-[13px] text-status-red bg-status-red/10 rounded-xl px-4 py-2.5">
              {error}
            </p>
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
