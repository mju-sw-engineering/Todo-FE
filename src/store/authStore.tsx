'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { registerAuthBridge } from '@/lib/authBridge'
import { clearAllCache } from '@/lib/requestCache'
import type { AuthUser } from '@/types/auth.types'

interface AuthSlice {
  token: string | null
  user: AuthUser | null
  isInitialized: boolean
}

interface AuthState extends AuthSlice {
  setAuth: (token: string, user: AuthUser) => void
  updateUser: (updates: Partial<AuthUser>) => void
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuthSlice] = useState<AuthSlice>({
    token: null,
    user: null,
    isInitialized: false,
  })

  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken')
    const savedUser = localStorage.getItem('user')
    let user: AuthUser | null = null
    if (savedUser) {
      try {
        user = JSON.parse(savedUser) as AuthUser
      } catch {
        localStorage.removeItem('user')
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time mount init from localStorage, no cascade risk
    setAuthSlice({ token: savedToken, user, isInitialized: true })
  }, [])

  const setAuth = useCallback((token: string, user: AuthUser) => {
    localStorage.setItem('accessToken', token)
    localStorage.setItem('user', JSON.stringify(user))
    setAuthSlice({ token, user, isInitialized: true })
  }, [])

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setAuthSlice((prev) => {
      const updatedUser = prev.user ? { ...prev.user, ...updates } : null
      if (updatedUser) localStorage.setItem('user', JSON.stringify(updatedUser))
      return { ...prev, user: updatedUser }
    })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    clearAllCache()
    setAuthSlice({ token: null, user: null, isInitialized: true })
  }, [])

  // apiClient가 토큰 갱신 결과를 반영할 수 있도록 접근자를 등록한다.
  // ref로 읽는 이유는 등록 시점의 클로저가 옛 토큰을 붙잡지 않게 하기 위해서다.
  const tokenRef = useRef(auth.token)

  useEffect(() => {
    tokenRef.current = auth.token
  }, [auth.token])

  useEffect(() => {
    return registerAuthBridge({
      getToken: () => tokenRef.current,
      onTokenRefreshed: (token) => {
        localStorage.setItem('accessToken', token)
        setAuthSlice((prev) => ({ ...prev, token }))
      },
      // 갱신까지 실패하면 재로그인이 필요하다. 여기서 화면을 옮기지 않고 토큰만 비우면
      // 레이아웃의 인증 가드가 로그인으로 보낸다.
      onAuthExpired: logout,
    })
  }, [logout])

  return (
    <AuthContext.Provider value={{ ...auth, setAuth, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
