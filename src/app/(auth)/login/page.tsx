'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { BlobAvatar } from '@/components/ui/BlobAvatar'
import { AngelBlob, DevilBlob } from '@/components/ui/BlobCharacter'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { getMyProfile, login } from '@/services/authService'
import { useAuth } from '@/store/authStore'

interface FallingCharProps {
  delay: number
  initialRotate?: number
  floatDuration?: number
  className?: string
  children: React.ReactNode
}

function FallingChar({
  delay,
  initialRotate = 0,
  floatDuration = 3.5,
  className = '',
  children,
}: FallingCharProps) {
  return (
    <motion.div
      className={`absolute ${className}`}
      initial={{ y: -420, opacity: 0, rotate: initialRotate }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      transition={{ type: 'spring', damping: 11, stiffness: 90, delay }}
    >
      <motion.div
        animate={{ y: [0, -7, 4, 0] }}
        transition={{
          delay: delay + 0.8,
          duration: floatDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

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
      {/* 캐릭터 영역 */}
      <div className="flex-1 relative overflow-hidden">
        {/* 타이틀 */}
        <div className="absolute top-10 left-6 z-20">
          <h1 className="text-[40px] font-black text-gray-900 tracking-tight leading-none">
            TodoTeam
          </h1>
          <p className="text-[13px] text-gray-500 font-medium mt-2">팀과 함께 완성하는 하루</p>
        </div>

        {/* 우상단 — 작은 블롭 */}
        <FallingChar delay={0.05} initialRotate={15} floatDuration={3.2} className="top-6 -right-2">
          <BlobAvatar seed="login-e" size={80} />
        </FallingChar>

        {/* 메인 엔젤 — 우측 중앙 */}
        <FallingChar
          delay={0.18}
          initialRotate={-12}
          floatDuration={3.8}
          className="top-[22%] -right-3.5"
        >
          <AngelBlob size={190} />
        </FallingChar>

        {/* 메인 데빌 — 좌측 중하단 */}
        <FallingChar
          delay={0.32}
          initialRotate={10}
          floatDuration={3.5}
          className="top-[38%] -left-3"
        >
          <DevilBlob size={165} />
        </FallingChar>

        {/* 중앙 블롭 */}
        <FallingChar
          delay={0.44}
          initialRotate={-8}
          floatDuration={4.0}
          className="top-[48%] left-[42%]"
        >
          <BlobAvatar seed="login-a" size={92} />
        </FallingChar>

        {/* 우하단 블롭 */}
        <FallingChar
          delay={0.55}
          initialRotate={18}
          floatDuration={3.6}
          className="bottom-10 -right-1.5"
        >
          <BlobAvatar seed="login-b" size={100} />
        </FallingChar>

        {/* 좌하단 블롭 */}
        <FallingChar
          delay={0.65}
          initialRotate={-14}
          floatDuration={3.3}
          className="bottom-4 left-[28%]"
        >
          <BlobAvatar seed="login-c" size={76} />
        </FallingChar>

        {/* 상단 중앙 블롭 */}
        <FallingChar
          delay={0.75}
          initialRotate={6}
          floatDuration={2.9}
          className="top-[18%] left-[34%]"
        >
          <BlobAvatar seed="login-f" size={64} />
        </FallingChar>
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
