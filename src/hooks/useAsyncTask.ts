import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/lib/apiError'

interface RunOptions {
  fallback?: string
  statusMessages?: Partial<Record<number, string>>
  rethrow?: boolean
}

/** 경고·에러 메시지는 react-hot-toast로 띄운다. `error`는 호환을 위해 최근 메시지를 들고 있을 뿐,
 *  직접 렌더링하지 말고 toast가 이미 보여준다고 생각한다. */
export function useAsyncTask(initialLoading = false) {
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [error, setErrorState] = useState<string | null>(null)

  const setError = useCallback((message: string | null) => {
    setErrorState(message)
    if (message) toast.error(message)
  }, [])

  const run = useCallback(async function run<T>(
    fn: () => Promise<T>,
    options?: RunOptions
  ): Promise<T | undefined> {
    setIsLoading(true)
    setErrorState(null)
    try {
      return await fn()
    } catch (err) {
      const message = getErrorMessage(
        err,
        options?.fallback ?? '요청에 실패했습니다.',
        options?.statusMessages
      )
      setErrorState(message)
      toast.error(message)
      if (options?.rethrow) throw err
      return undefined
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { isLoading, error, setError, run }
}
