'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
        },
      })
  )
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: {
            background: 'var(--color-ink)',
            color: 'var(--color-static-white)',
            fontSize: '13px',
            fontWeight: 500,
            borderRadius: '12px',
            padding: '10px 16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            maxWidth: '360px',
          },
          success: {
            iconTheme: { primary: 'var(--color-primary)', secondary: 'var(--color-ink)' },
          },
          error: {
            iconTheme: { primary: 'var(--color-status-red)', secondary: 'var(--color-ink)' },
          },
        }}
      />
    </QueryClientProvider>
  )
}
