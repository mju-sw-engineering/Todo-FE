import { useCallback, useState } from 'react'
import { getErrorMessage } from '@/lib/apiError'

interface RunOptions {
  fallback?: string
  statusMessages?: Partial<Record<number, string>>
  rethrow?: boolean
}

export function useAsyncTask(initialLoading = false) {
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async function run<T>(
    fn: () => Promise<T>,
    options?: RunOptions
  ): Promise<T | undefined> {
    setIsLoading(true)
    setError(null)
    try {
      return await fn()
    } catch (err) {
      setError(
        getErrorMessage(err, options?.fallback ?? '요청에 실패했습니다.', options?.statusMessages)
      )
      if (options?.rethrow) throw err
      return undefined
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { isLoading, error, setError, run }
}
