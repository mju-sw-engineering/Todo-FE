'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { AppleSignInCancelledError, requestAppleCredential } from '@/lib/appleAuth'
import { clearAppleSetup, saveAppleSetup } from '@/lib/appleSetupStorage'
import { getMyProfile, loginWithApple } from '@/services/authService'
import { useAuth } from '@/store/authStore'

/**
 * 애플 로그인 1단계.
 *
 * 기존 회원이면 그대로 로그인이 끝나고, 처음 보는 애플 계정이면 닉네임을 받아야 하므로
 * setup token을 넘겨 `/apple-setup`으로 보낸다. 로그인·회원가입 두 화면에서 같은 흐름을
 * 쓰므로 훅으로 뺐다.
 */
export function useAppleSignIn() {
  const router = useRouter()
  const { setAuth } = useAuth()
  const { isLoading, error, setError, run } = useAsyncTask()

  const signIn = useCallback(async () => {
    await run(
      async () => {
        let credential
        try {
          credential = await requestAppleCredential()
        } catch (e) {
          // 사용자가 시트를 닫은 것은 실패가 아니다. 조용히 끝낸다.
          if (e instanceof AppleSignInCancelledError) return
          throw e
        }

        const result = await loginWithApple({
          identityToken: credential.identityToken,
          authorizationCode: credential.authorizationCode,
          nonce: credential.nonce,
        })

        if ('setupToken' in result) {
          // 애플이 이름을 주는 건 최초 1회뿐이라 여기서 넘겨야 닉네임 기본값을 채울 수 있다.
          saveAppleSetup({ setupToken: result.setupToken, suggestedNickname: credential.fullName })
          router.push('/apple-setup')
          return
        }

        clearAppleSetup()
        const profile = await getMyProfile(result.accessToken)
        setAuth(result.accessToken, {
          loginId: profile.loginId,
          nickname: profile.nickname,
          profileImageUrl: profile.profileImageUrl,
          userId: profile.userId,
        })
        router.push('/')
      },
      { fallback: '애플 로그인 중 오류가 발생했습니다.' }
    )
  }, [run, setAuth, router])

  return { signIn, isLoading, error, setError }
}
