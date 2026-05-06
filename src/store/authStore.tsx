'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import type { AuthUser } from '@/types/auth.types'

interface AuthState {
  user: AuthUser | null
  token: string | null
  isInitialized: boolean
  setAuth: (token: string, user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('accessToken')
  })
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return null
    const saved = localStorage.getItem('user')
    try {
      return saved ? (JSON.parse(saved) as AuthUser) : null
    } catch {
      localStorage.removeItem('user')
      return null
    }
  })

  const setAuth = useCallback((newToken: string, newUser: AuthUser) => {
    localStorage.setItem('accessToken', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isInitialized: true, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
