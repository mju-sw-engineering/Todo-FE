'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BeePose } from '@/components/bee/BeePose'
import { ConsentAgreements, type ConsentState } from '@/components/ConsentAgreements'
import { ProfileImagePicker } from '@/components/ProfileImagePicker'
import { AppleLoginButton } from '@/components/ui/AppleLoginButton'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { HiveIcon } from '@/components/ui/HiveIcon'
import { Input } from '@/components/ui/Input'
import { useAppleSignIn } from '@/hooks/useAppleSignIn'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { usePresignedUpload } from '@/hooks/usePresignedUpload'
import {
  getMyProfile,
  login,
  sendEmailVerification,
  signup,
  verifyEmailCode,
} from '@/services/authService'
import { useAuth } from '@/store/authStore'

const CODE_TTL_SECONDS = 180

type EmailStatus = 'idle' | 'sent' | 'verified'

export default function SignupPage() {
  const router = useRouter()
  const { setAuth } = useAuth()

  /** 가입 성공 + 자동 로그인까지 되면 '벌집 합류' 환영 화면을 보여준다 */
  const [showWelcome, setShowWelcome] = useState(false)

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle')
  const [emailVerificationToken, setEmailVerificationToken] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(CODE_TTL_SECONDS)

  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [nickname, setNickname] = useState('')
  const [profileImage, setProfileImage] = useState<File | null>(null)

  const [consents, setConsents] = useState<ConsentState>({
    termsAgreed: false,
    privacyAgreed: false,
    marketingAgreed: false,
  })

  const { isLoading, setError, run } = useAsyncTask()
  const apple = useAppleSignIn()
  const sendTask = useAsyncTask()
  const verifyTask = useAsyncTask()
  const { upload, isUploading } = usePresignedUpload({
    type: 'PROFILE',
    signupToken: emailVerificationToken,
  })

  useEffect(() => {
    if (emailStatus !== 'sent') return
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [emailStatus])

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value)
    if (emailStatus !== 'idle') {
      setEmailStatus('idle')
      setEmailVerificationToken('')
      setCode('')
    }
  }

  async function handleSendCode() {
    setError('')
    if (!email) return setError('이메일을 입력해 주세요.')
    await sendTask.run(
      async () => {
        await sendEmailVerification({ email })
        setEmailStatus('sent')
        setSecondsLeft(CODE_TTL_SECONDS)
        setCode('')
      },
      { fallback: '인증코드 발송에 실패했습니다.' }
    )
  }

  async function handleVerifyCode() {
    setError('')
    if (!code) return setError('인증코드를 입력해 주세요.')
    await verifyTask.run(
      async () => {
        const result = await verifyEmailCode({ email, code })
        setEmailVerificationToken(result.emailVerificationToken)
        setEmailStatus('verified')
      },
      { fallback: '인증코드 확인에 실패했습니다.' }
    )
  }

  async function handleAppleSignIn() {
    setError('')
    await apple.signIn()
  }

  function handleImageSelect(file: File) {
    setError('')
    setProfileImage(file)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    apple.setError(null)
    if (emailStatus !== 'verified' || !emailVerificationToken) {
      return setError('이메일 인증을 완료해 주세요.')
    }
    if (password.length < 6) return setError('비밀번호는 6자 이상이어야 합니다.')
    if (password !== passwordConfirm) return setError('비밀번호가 일치하지 않습니다.')
    if (!consents.termsAgreed || !consents.privacyAgreed)
      return setError('필수 약관에 동의해 주세요.')

    await run(
      async () => {
        let profileImageKey: string | null = null
        if (profileImage) {
          // 프로필 사진은 선택 항목이다. 업로드가 실패했다고 가입까지 막으면
          // 스토리지 장애나 일시적인 네트워크 오류로 계정 생성 자체가 불가능해진다.
          // 사진 없이 가입시키고 마이페이지에서 다시 올리게 둔다.
          try {
            profileImageKey = await upload(profileImage)
          } catch {
            profileImageKey = null
          }
        }
        await signup({
          email,
          emailVerificationToken,
          loginId,
          password,
          passwordConfirm,
          nickname,
          profileImageKey,
          ...consents,
        })
        try {
          const { accessToken } = await login({ loginId, password })
          const profile = await getMyProfile(accessToken)
          setAuth(accessToken, {
            loginId,
            nickname: profile.nickname,
            profileImageUrl: profile.profileImageUrl,
            userId: profile.userId,
          })
          setShowWelcome(true)
        } catch {
          // 자동 로그인 실패 시 기존 동선 유지
          router.push('/login?registered=1')
        }
      },
      { fallback: '회원가입 중 오류가 발생했습니다.' }
    )
  }

  const passwordMismatch = passwordConfirm.length > 0 && password !== passwordConfirm
  const passwordTooShort = password.length > 0 && password.length < 6
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  // 필수 항목을 다 채워야만 완료 버튼이 아래에서 올라온다 — 토스 스타일 CTA
  const isFormValid =
    emailStatus === 'verified' &&
    Boolean(emailVerificationToken) &&
    loginId.trim().length > 0 &&
    password.length >= 6 &&
    password === passwordConfirm &&
    nickname.trim().length > 0 &&
    consents.termsAgreed &&
    consents.privacyAgreed

  if (showWelcome) {
    return (
      <div className="flex-1 flex flex-col animate-fade-up overflow-hidden">
        <div className="flex-1 relative flex flex-col items-center justify-center gap-1.5 overflow-hidden bg-[linear-gradient(155deg,#ffedc2_0%,#fdf7ec_55%,#e8f1ff_100%)]">
          <div className="hex-pattern absolute inset-0 opacity-50 pointer-events-none" />
          <div className="relative mb-3">
            <HiveIcon size={96} />
            <div className="absolute -left-16 top-8 bee-bob">
              <BeePose pose="confetti" size={58} flip decorative />
            </div>
          </div>
          <p className="relative text-[22px] font-jua text-ink px-8 text-center break-keep">
            환영해요, {nickname}님!
          </p>
          <p className="relative text-[13px] text-gray-500 font-medium">
            이제 우리 벌집을 만들어볼까요?
          </p>
        </div>
        <div className="bg-white rounded-t-4xl shadow-[0_-6px_32px_rgba(0,0,0,0.10)] px-6 pt-6 pb-10 flex flex-col gap-2.5">
          <Button size="lg" onClick={() => router.push('/teams/new')}>
            팀 만들기
          </Button>
          <Button variant="outline" size="lg" onClick={() => router.push('/teams?join=1')}>
            초대 코드로 참여
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white animate-fade-up">
      {/* Top header */}
      <div className="px-6 pt-5 pb-2">
        <div className="flex items-center gap-2">
          <BackButton onClick={() => router.push('/login')} />
          <h1 className="text-[18px] font-bold text-gray-900 tracking-tight">회원가입</h1>
        </div>
        <div className="flex items-center gap-1 mt-2">
          <BeePose pose="wave" size={60} decorative />
          <span className="bg-[#faf4e4] rounded-xl rounded-bl-[4px] px-3 py-1.5 text-[13px] font-jua text-[#57430f]">
            반가워요! 같이 꿀 모아요
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 overflow-y-auto px-6 pt-7 pb-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-[13px] font-semibold text-gray-700 tracking-wide"
            >
              이메일<span className="text-status-red ml-0.5">*</span>
            </label>
            <div className="flex gap-2">
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="이메일을 입력해 주세요"
                required
                disabled={emailStatus === 'verified'}
                className="flex-1 min-w-0 px-4 py-3.25 rounded-[14px] border-[1.5px] border-border bg-white text-[16px] text-ink placeholder:text-muted placeholder:font-light outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_3px_rgba(102,154,255,0.15)] disabled:bg-gray-50 disabled:text-muted"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                fullWidth={false}
                className="shrink-0 px-4 whitespace-nowrap"
                onClick={handleSendCode}
                disabled={sendTask.isLoading || emailStatus === 'verified'}
              >
                {emailStatus === 'sent' ? '재발송' : '인증번호 발송'}
              </Button>
            </div>
            {emailStatus === 'verified' && (
              <p className="text-xs text-emerald-500">이메일 인증이 완료되었습니다.</p>
            )}
          </div>

          {emailStatus === 'sent' && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="code"
                className="text-[13px] font-semibold text-gray-700 tracking-wide"
              >
                인증번호<span className="text-status-red ml-0.5">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="code"
                  type="text"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="6자리 인증번호"
                  maxLength={6}
                  className="flex-1 min-w-0 px-4 py-3.25 rounded-[14px] border-[1.5px] border-border bg-white text-[16px] text-ink placeholder:text-muted placeholder:font-light outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_3px_rgba(102,154,255,0.15)]"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  fullWidth={false}
                  className="shrink-0 px-4"
                  onClick={handleVerifyCode}
                  disabled={verifyTask.isLoading || secondsLeft <= 0}
                >
                  확인
                </Button>
              </div>
              <p className={`text-xs ${secondsLeft <= 0 ? 'text-status-red' : 'text-muted'}`}>
                {secondsLeft > 0
                  ? `남은 시간 ${mm}:${ss}`
                  : '인증 시간이 만료되었습니다. 재발송해 주세요.'}
              </p>
            </div>
          )}

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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6자 이상 입력해 주세요"
            required
            hint={passwordTooShort ? '비밀번호는 6자 이상이어야 합니다.' : undefined}
          />
          <Input
            id="passwordConfirm"
            label="비밀번호 확인"
            type="password"
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="비밀번호를 다시 입력해 주세요"
            required
            hint={passwordMismatch ? '비밀번호가 일치하지 않습니다.' : undefined}
          />
          <Input
            id="nickname"
            label="닉네임"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임을 입력해 주세요"
            required
          />

          <ProfileImagePicker
            onSelect={handleImageSelect}
            onError={setError}
            showFallbackHint={Boolean(nickname)}
          />

          <ConsentAgreements value={consents} onChange={setConsents} />

          {/* iOS 네이티브가 아니면 버튼 자체가 렌더되지 않는다 */}
          <AppleLoginButton
            label="Apple로 가입"
            onClick={handleAppleSignIn}
            disabled={isLoading || isUploading || apple.isLoading}
          />
        </div>

        {/* 필수 항목을 다 채워야만 아래에서 올라온다 — 뒤로 가기는 이미 상단 BackButton이 하므로 여기 따로 안 둔다 */}
        <AnimatePresence>
          {isFormValid && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="shrink-0 bg-white rounded-t-4xl shadow-[0_-6px_32px_rgba(0,0,0,0.10)] px-6 pt-5 pb-8"
            >
              <Button
                type="submit"
                size="lg"
                disabled={isLoading || isUploading || apple.isLoading}
              >
                {isUploading ? '이미지 업로드 중...' : isLoading ? '가입 중...' : '완료'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  )
}
