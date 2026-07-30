'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { usePresignedUpload } from '@/hooks/usePresignedUpload'
import { sendEmailVerification, signup, verifyEmailCode } from '@/services/authService'

const ALLOWED_TYPES = ['image/jpeg', 'image/png']
const CODE_TTL_SECONDS = 180

type EmailStatus = 'idle' | 'sent' | 'verified'

export default function SignupPage() {
  const router = useRouter()

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [termsAgreed, setTermsAgreed] = useState(false)
  const [privacyAgreed, setPrivacyAgreed] = useState(false)
  const [marketingAgreed, setMarketingAgreed] = useState(false)

  const { isLoading, error, setError, run } = useAsyncTask()
  const sendTask = useAsyncTask()
  const verifyTask = useAsyncTask()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { upload, isUploading } = usePresignedUpload({ type: 'PROFILE' })

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

  function handleAllAgreeChange(checked: boolean) {
    setTermsAgreed(checked)
    setPrivacyAgreed(checked)
    setMarketingAgreed(checked)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('jpg, png 형식의 이미지만 업로드할 수 있습니다.')
      e.target.value = ''
      return
    }
    setError('')
    setProfileImage(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    if (emailStatus !== 'verified' || !emailVerificationToken) {
      return setError('이메일 인증을 완료해 주세요.')
    }
    if (password.length < 6) return setError('비밀번호는 6자 이상이어야 합니다.')
    if (password !== passwordConfirm) return setError('비밀번호가 일치하지 않습니다.')
    if (!termsAgreed || !privacyAgreed) return setError('필수 약관에 동의해 주세요.')

    await run(
      async () => {
        let profileImageKey: string | null = null
        if (profileImage) {
          profileImageKey = await upload(profileImage)
        }
        await signup({
          email,
          emailVerificationToken,
          loginId,
          password,
          passwordConfirm,
          nickname,
          profileImageKey,
          termsAgreed,
          privacyAgreed,
          marketingAgreed,
        })
        router.push('/login?registered=1')
      },
      { fallback: '회원가입 중 오류가 발생했습니다.' }
    )
  }

  const passwordMismatch = passwordConfirm.length > 0 && password !== passwordConfirm
  const passwordTooShort = password.length > 0 && password.length < 6
  const allAgreed = termsAgreed && privacyAgreed && marketingAgreed
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  return (
    <div className="flex-1 flex flex-col bg-white animate-fade-up">
      {/* Top header */}
      <div className="px-6 pt-10 pb-6 text-center border-b border-border">
        <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">회원가입</h1>
        <p className="text-[13px] text-gray-400 mt-1">반가워요! 팀과 함께해요</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-7 pb-12">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-[13px] font-semibold text-gray-700 tracking-wide"
            >
              이메일
            </label>
            <div className="flex gap-2">
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="이메일을 입력해 주세요"
                required
                disabled={emailStatus === 'verified'}
                className="flex-1 min-w-0 px-4 py-3.25 rounded-[14px] border-[1.5px] border-border bg-white text-[14px] text-ink placeholder:text-muted placeholder:font-light outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_3px_rgba(102,154,255,0.15)] disabled:bg-gray-50 disabled:text-muted"
              />
              <Button
                type="button"
                variant="secondary"
                size="md"
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
                인증번호
              </label>
              <div className="flex gap-2">
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="6자리 인증번호"
                  maxLength={6}
                  className="flex-1 min-w-0 px-4 py-3.25 rounded-[14px] border-[1.5px] border-border bg-white text-[14px] text-ink placeholder:text-muted placeholder:font-light outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_3px_rgba(102,154,255,0.15)]"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
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
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="아이디를 입력해 주세요"
            required
          />
          <Input
            id="password"
            label="비밀번호"
            type="password"
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

          {/* Profile photo — show blob preview if no upload */}
          <div>
            <p className="text-[13px] font-semibold text-gray-700 tracking-wide mb-2.5">
              프로필 사진 <span className="text-[12px] font-normal text-muted">선택</span>
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-2xl border-2 border-dashed border-border bg-gray-50 flex items-center justify-center overflow-hidden transition-all duration-200 hover:border-gray-400 hover:bg-gray-100 relative"
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="프로필 미리보기"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-6 h-6 text-muted"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              )}
            </button>
            {!previewUrl && nickname && (
              <p className="text-[11px] text-gray-400 mt-1.5">기본 아바타가 사용됩니다</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-border p-4">
            <label className="flex items-center gap-2.5 text-[14px] font-semibold text-gray-900">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary"
                checked={allAgreed}
                onChange={(e) => handleAllAgreeChange(e.target.checked)}
              />
              전체 동의
            </label>
            <div className="h-px bg-border" />
            <label className="flex items-center gap-2.5 text-[13px] text-gray-700">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
              />
              (필수) 이용약관 동의
            </label>
            <label className="flex items-center gap-2.5 text-[13px] text-gray-700">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary"
                checked={privacyAgreed}
                onChange={(e) => setPrivacyAgreed(e.target.checked)}
              />
              (필수) 개인정보 처리방침 동의
            </label>
            <label className="flex items-center gap-2.5 text-[13px] text-gray-700">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary"
                checked={marketingAgreed}
                onChange={(e) => setMarketingAgreed(e.target.checked)}
              />
              (선택) 마케팅 정보 수신 동의
            </label>
          </div>

          {error && (
            <p className="text-sm text-status-red bg-status-red/10 rounded-xl px-3.5 py-2.5">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" disabled={isLoading || isUploading}>
            {isUploading ? '이미지 업로드 중...' : isLoading ? '가입 중...' : '완료'}
          </Button>
        </form>

        <Link
          href="/login"
          className="block text-center mt-auto pt-8 text-[14px] font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          로그인으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
