const store = new Map<string, { data: unknown; expiresAt: number }>()
const inflight = new Map<string, Promise<unknown>>()

export function invalidateCache(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key)
  }
  for (const key of inflight.keys()) {
    if (key.startsWith(prefix)) inflight.delete(key)
  }
}

/**
 * 키 하나만 정확히 버린다. 접두사 무효화는 `todo:1`이 `todo:12`까지 지우므로,
 * 특정 항목이 바뀐 걸 아는 경로에서는 이쪽을 쓴다.
 */
export function invalidateCacheKey(key: string): void {
  store.delete(key)
  inflight.delete(key)
}

export function clearAllCache(): void {
  store.clear()
  inflight.clear()
}

export async function cachedRequest<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number
): Promise<T> {
  const entry = store.get(key)
  if (entry && Date.now() < entry.expiresAt) {
    return entry.data as T
  }

  const existing = inflight.get(key)
  if (existing) return existing as Promise<T>

  const promise = fetcher()
    .then((data) => {
      store.set(key, { data, expiresAt: Date.now() + ttlMs })
      inflight.delete(key)
      return data
    })
    .catch((err) => {
      inflight.delete(key)
      throw err
    })

  inflight.set(key, promise)
  return promise
}
