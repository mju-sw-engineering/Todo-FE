'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/store/authStore'

export default function Home() {
  const router = useRouter()
  const { user, token, isInitialized, logout } = useAuth()

  useEffect(() => {
    if (isInitialized && !token) {
      router.replace('/login')
    }
  }, [isInitialized, token, router])

  function handleLogout() {
    logout()
    router.push('/login')
  }

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Todo</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            안녕하세요, <span className="font-medium text-gray-900">{user.nickname}</span>님
          </span>
          <button
            onClick={() => router.push('/teams')}
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            내 팀
          </button>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-gray-400 text-sm text-center">할 일 목록이 여기에 표시됩니다.</p>
      </main>
    </div>
  )
}
