'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { findId, sendEmailVerification, verifyEmailCode } from '@/services/authService'

const CODE_TTL_SECONDS = 180

type EmailStatus = 'idle' | 'sent' | 'verified'

export default function FindIdPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle')
  const [secondsLeft, setSecondsLeft] = useState(CODE_TTL_SECONDS)
  const [foundLoginId, setFoundLoginId] = useState<string | null>(null)

  const sendTask = useAsyncTask()
  const verifyTask = useAsyncTask()
  const findTask = useAsyncTask()

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
      setCode('')
    }
  }

  async function handleSendCode() {
    if (!email) return sendTask.setError('이메일을 입력해 주세요.')
    await sendTask.run(
      async () => {
        await sendEmailVerification({ email })
        setEmailStatus('sent')
        setSecondsLeft(CODE_TTL_SECONDS)
        setCode('')
      },
      {
        fallback: '인증코드 발송에 실패했습니다.',
        statusMessages: { 404: '가입된 이메일이 아닙니다.' },
      }
    )
  }

  async function handleVerifyCode() {
    if (!code) return verifyTask.setError('인증코드를 입력해 주세요.')
    await verifyTask.run(
      async () => {
        const { emailVerificationToken } = await verifyEmailCode({ email, code })
        setEmailStatus('verified')

        const result = await findId({ email, emailVerificationToken })
        setFoundLoginId(result.loginId)
      },
      {
        fallback: '인증코드 확인에 실패했습니다.',
        statusMessages: {
          400: 'Apple로 가입한 계정은 아이디가 없습니다.',
          404: '해당 이메일로 가입된 계정이 없습니다.',
        },
      }
    )
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  if (foundLoginId) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-white animate-fade-up">
        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <BackButton onClick={() => router.push('/login')} />
            <h1 className="text-[18px] font-bold text-gray-900 tracking-tight">아이디 찾기</h1>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="text-[14px] text-muted">가입하신 아이디는</p>
          <p className="text-[24px] font-black text-ink break-all">{foundLoginId}</p>
          <p className="text-[13px] text-muted">입니다.</p>
        </div>

        <div className="px-6 pt-5 pb-8 flex flex-col gap-3">
          <Button size="lg" onClick={() => router.push('/login')}>
            로그인하러 가기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white animate-fade-up">
      <div className="px-6 pt-5 pb-2">
        <div className="flex items-center gap-2">
          <BackButton onClick={() => router.push('/login')} />
          <h1 className="text-[18px] font-bold text-gray-900 tracking-tight">아이디 찾기</h1>
        </div>
        <p className="text-[13px] text-muted mt-2">
          가입할 때 쓴 이메일을 인증하면 아이디를 알려드려요.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-7 pb-6 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-[13px] font-semibold text-gray-700 tracking-wide">
            이메일
          </label>
          <div className="flex gap-2">
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="가입 시 이메일을 입력해 주세요"
              required
              disabled={emailStatus === 'verified'}
              className="flex-1 min-w-0 px-4 py-3.25 rounded-[14px] border-[1.5px] border-border bg-white text-[16px] text-ink placeholder:text-muted placeholder:font-light outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_3px_rgba(102,154,255,0.15)] disabled:bg-gray-50 disabled:text-muted"
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
        </div>

        {emailStatus === 'sent' && (
          <div className="flex flex-col gap-2">
            <label htmlFor="code" className="text-[13px] font-semibold text-gray-700 tracking-wide">
              인증번호
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
                size="md"
                fullWidth={false}
                className="shrink-0 px-4"
                onClick={handleVerifyCode}
                disabled={verifyTask.isLoading || findTask.isLoading || secondsLeft <= 0}
              >
                {verifyTask.isLoading || findTask.isLoading ? '확인 중' : '확인'}
              </Button>
            </div>
            <p className={`text-xs ${secondsLeft <= 0 ? 'text-status-red' : 'text-muted'}`}>
              {secondsLeft > 0
                ? `남은 시간 ${mm}:${ss}`
                : '인증 시간이 만료되었습니다. 재발송해 주세요.'}
            </p>
          </div>
        )}

        <Link
          href="/login"
          className="text-center text-[14px] font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          로그인으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
