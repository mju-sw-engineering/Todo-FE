'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { AppleLoginButton } from '@/components/ui/AppleLoginButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAppleAvailable } from '@/hooks/useAppleAvailable'
import { useAppleSignIn } from '@/hooks/useAppleSignIn'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { getMyProfile, login } from '@/services/authService'
import { useAuth } from '@/store/authStore'
import { LoginBeeScene } from './components/LoginBeeScene'

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  )
}

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next')
  const { setAuth } = useAuth()

  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const { isLoading, setError, run } = useAsyncTask()
  const apple = useAppleSignIn()

  // 애플 로그인을 못 쓰는 환경(브라우저·Android)에서는 아이디 로그인이 유일한 수단이므로
  // 처음부터 펼쳐 둔다. 접어두면 로그인하려고 한 번 더 눌러야 하는 퇴행이 된다.
  //
  // 초기값을 state에 담으면 안 된다. useState 초기화는 하이드레이션 첫 렌더에서 한 번만 도는데
  // 그 시점의 useSyncExternalStore는 서버 스냅샷(false)을 주므로, iOS에서도 폼이 펼쳐진 채 굳는다.
  const appleAvailable = useAppleAvailable()
  const [expandedByUser, setExpandedByUser] = useState(false)
  const showPasswordForm = expandedByUser || !appleAvailable

  // 한 흐름을 새로 시작하면 다른 흐름의 지난 오류를 지운다. 그러지 않으면
  // 아이디 로그인에 실패한 뒤 애플 로그인을 눌렀을 때 옛 오류가 그대로 남는다.
  async function handleAppleSignIn() {
    setError(null)
    await apple.signIn()
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    apple.setError(null)
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
        // 외부 도메인으로 리다이렉트되지 않도록 상대 경로만 허용한다
        router.push(nextPath?.startsWith('/') ? nextPath : '/')
      },
      { fallback: '로그인 중 오류가 발생했습니다.' }
    )
  }

  return (
    <div className="flex flex-1 flex-col animate-fade-up">
      {/* 타이틀 + 로그인 벌 인트로 */}
      <div className="flex-1 min-h-64 relative mt-[calc(env(safe-area-inset-top)*-1)] px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-8 flex flex-col justify-start items-end text-right overflow-hidden">
        <LoginBeeScene />

        <h1 className="relative text-[40px] font-jua text-ink tracking-tight leading-none">
          두비두비
        </h1>
        <p className="relative text-[13px] text-white font-medium">팀과 함께 완성하는 하루</p>
      </div>

      {/* 폼 바텀 시트 — 위 인트로와 사이가 뜨지 않도록 살짝 겹쳐 올린다.
          배경 영상이 absolute라 확실히 그 위에 그려지도록 z-10을 준다.

          하단 여백: (auth) 레이아웃이 이미 안전영역 bottom을 패딩으로 잡아두므로 여기에
          고정 pb를 더하면 두 값이 쌓인다(iPhone 17 Pro에서 40+34=74pt로 과했다).
          "바닥까지 총 40px을 확보하되 실제 패딩은 최소 20px"로 계산해 노치 기기에서만
          줄어들게 한다 — 안전영역이 0인 웹에서는 기존 40px 그대로라 시연 화면이 변하지 않는다. */}
      <div className="relative z-10 -mt-5 bg-white rounded-t-4xl shadow-[0_-6px_32px_rgba(0,0,0,0.10)] px-6 pt-7 pb-[max(1.25rem,calc(2.5rem-env(safe-area-inset-bottom)))] flex flex-col gap-4">
        {/* 두 방식을 한 번에 하나씩만 보여준다. 둘을 겹쳐 쌓으면 시트가 그만큼 높아지고,
            히어로가 눌려 벌 더듬이가 상태바에 잘린다(펼침 상태에서 424pt가 필요한데 417pt였다).
            iOS 네이티브가 아니면 AppleLoginButton이 null이라 웹은 언제나 폼만 보인다. */}
        {!showPasswordForm && (
          <>
            <AppleLoginButton onClick={handleAppleSignIn} disabled={isLoading || apple.isLoading} />
            <button
              type="button"
              onClick={() => setExpandedByUser(true)}
              className="text-[14px] font-semibold text-gray-500 py-1.5 hover:text-gray-800 transition-colors duration-200"
            >
              아이디로 로그인
            </button>
          </>
        )}

        {showPasswordForm && (
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

            <Button
              type="submit"
              size="lg"
              disabled={isLoading || apple.isLoading}
              className="mt-1"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>

            <Link
              href="/find-id"
              className="text-center text-[13px] text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              아이디를 잊으셨나요?
            </Link>
          </form>
        )}

        {/* 애플 버튼을 감춘 대신 돌아갈 길을 반드시 남긴다. 없으면 잘못 눌러 폼을 펼친 사람이
            애플 로그인으로 되돌아갈 방법이 없어 갇힌다. 애플을 못 쓰는 웹에서는
            돌아갈 곳 자체가 없으므로 렌더하지 않는다. */}
        {showPasswordForm && appleAvailable && (
          <button
            type="button"
            onClick={() => setExpandedByUser(false)}
            className="text-[14px] font-semibold text-gray-500 py-1.5 hover:text-gray-800 transition-colors duration-200"
          >
            Apple로 로그인
          </button>
        )}

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
