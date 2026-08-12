'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BeeCharacter } from '@/components/bee/BeeCharacter'
import { ConsentAgreements, type ConsentState } from '@/components/ConsentAgreements'
import { ProfileImagePicker } from '@/components/ProfileImagePicker'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { usePresignedUpload } from '@/hooks/usePresignedUpload'
import { ApiError } from '@/lib/apiClient'
import { clearAppleSetup, readAppleSetup } from '@/lib/appleSetupStorage'
import { completeAppleSignup, getMyProfile } from '@/services/authService'
import { useAuth } from '@/store/authStore'

/**
 * 애플 로그인 2단계 — 추가 정보 입력.
 *
 * 백엔드가 처음 보는 애플 계정에 setup token을 내주면 여기로 온다. 아이디·비밀번호는 애플
 * 계정에 없고 이메일은 백엔드가 identity token에서 뽑으므로, 이메일 가입과 맞춰야 하는 나머지
 * — 닉네임·프로필 사진·약관 동의 — 만 받는다. setup token은 5분이라 만료되면 처음부터 다시 해야 한다.
 */
export default function AppleSetupPage() {
  const router = useRouter()
  const { setAuth } = useAuth()

  const [setupToken, setSetupToken] = useState<string | null>(null)
  const [nickname, setNickname] = useState('')
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [consents, setConsents] = useState<ConsentState>({
    termsAgreed: false,
    privacyAgreed: false,
    marketingAgreed: false,
  })

  const { isLoading, error, setError, run } = useAsyncTask()
  const { upload, isUploading } = usePresignedUpload({ type: 'PROFILE' })

  useEffect(() => {
    const setup = readAppleSetup()
    if (!setup) {
      // 직접 주소로 들어왔거나 세션이 끊긴 경우. 여기서 할 수 있는 게 없다.
      router.replace('/login')
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 1회 세션 복원, 연쇄 렌더 없음
    setSetupToken(setup.setupToken)
    if (setup.suggestedNickname) setNickname(setup.suggestedNickname)
  }, [router])

  function handleImageSelect(file: File) {
    setError('')
    setProfileImage(file)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!setupToken) return

    setError('')
    const trimmed = nickname.trim()
    if (!trimmed) {
      setError('닉네임을 입력해 주세요.')
      return
    }
    if (!consents.termsAgreed || !consents.privacyAgreed) {
      setError('필수 약관에 동의해 주세요.')
      return
    }

    await run(
      async () => {
        let profileImageKey: string | null = null
        if (profileImage) {
          profileImageKey = await upload(profileImage)
        }

        let accessToken: string
        try {
          ;({ accessToken } = await completeAppleSignup({
            setupToken,
            nickname: trimmed,
            profileImageKey,
            ...consents,
          }))
        } catch (e) {
          // 400은 setup token 만료뿐 아니라 애플 토큰 교환 실패까지 포함하는데, 어느 쪽이든
          // 이 화면에서 다시 눌러봐야 같은 400이 반복된다. authorization code가 토큰 안에 박혀
          // 있고 그것도 단명·1회용이기 때문이다. 죽은 토큰을 버리고 로그인부터 다시 하게 보낸다.
          // 409(이미 가입)도 마찬가지로 이 토큰으로는 진행할 수 없다.
          if (e instanceof ApiError && (e.status === 400 || e.status === 409)) {
            clearAppleSetup()
            setTimeout(() => router.replace('/login'), 1200)
          }
          throw e
        }
        clearAppleSetup()

        const profile = await getMyProfile(accessToken)
        setAuth(accessToken, {
          loginId: profile.loginId,
          nickname: profile.nickname,
          profileImageUrl: profile.profileImageUrl,
          userId: profile.userId,
        })
        router.replace('/')
      },
      {
        fallback: '가입을 마치지 못했습니다.',
        // 400은 매핑하지 않고 서버 메시지를 그대로 보여준다. 만료된 setup token과 애플 토큰
        // 교환 실패가 모두 400으로 오는데, 여기서 "인증 시간이 만료됐습니다"로 덮어쓰면
        // 서버가 보낸 진짜 원인이 사라진다. 실제로 애플 키 설정 문제를 만료로 오인해
        // 원인을 찾는 데 한참 걸린 적이 있다.
        statusMessages: {
          409: '이미 가입된 애플 계정입니다. 로그인 화면으로 돌아갑니다.',
        },
      }
    )
  }

  // 세션 복원 전에는 폼을 그리지 않는다. 곧 /login으로 밀려날 수도 있다.
  if (!setupToken) return null

  return (
    <div className="flex-1 flex flex-col px-6 pt-12 pb-10 animate-fade-up">
      <div className="flex justify-center">
        <BeeCharacter expression="cheer" size={88} />
      </div>

      <h1 className="text-[24px] font-jua text-gray-900 text-center mt-4 leading-snug">
        거의 다 왔어요
      </h1>
      <p className="text-[13px] text-gray-500 text-center mt-2">
        팀원들에게 보여질 정보를 정해 주세요
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
        <Input
          id="nickname"
          label="닉네임"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임을 입력해 주세요"
          maxLength={20}
          autoFocus
          required
        />

        <ProfileImagePicker
          onSelect={handleImageSelect}
          onError={setError}
          showFallbackHint={Boolean(nickname)}
        />

        <ConsentAgreements value={consents} onChange={setConsents} />

        {error && (
          <p className="text-[13px] text-status-red bg-status-red/10 rounded-xl px-4 py-2.5">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={isLoading || isUploading} className="mt-1">
          {isUploading ? '이미지 업로드 중...' : isLoading ? '가입 중...' : '시작하기'}
        </Button>
      </form>
    </div>
  )
}
