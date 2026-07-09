import { ApiError } from './apiClient'

export function getErrorMessage(
  err: unknown,
  fallback: string,
  statusMessages?: Partial<Record<number, string>>
): string {
  if (err instanceof ApiError) {
    const mapped = err.status !== undefined ? statusMessages?.[err.status] : undefined
    return mapped ?? (err.message || fallback)
  }
  return fallback
}
