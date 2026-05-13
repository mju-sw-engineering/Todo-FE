'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { AuthUser } from '@/types/auth.types'

interface AuthSlice {
  token: string | null
  user: AuthUser | null
  isInitialized: boolean
}

interface AuthState extends AuthSlice {
  setAuth: (token: string, user: AuthUser) => void
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

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    setAuthSlice({ token: null, user: null, isInitialized: true })
  }, [])

  return (
    <AuthContext.Provider value={{ ...auth, setAuth, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
