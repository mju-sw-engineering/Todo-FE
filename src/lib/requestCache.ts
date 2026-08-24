const store = new Map<string, { data: unknown; expiresAt: number }>()
const inflight = new Map<string, Promise<unknown>>()

/**
 * 무효화가 일어날 때마다 올라간다.
 * 무효화는 진행 중인 요청을 취소하지 못하므로, 요청이 시작될 때의 값을 기억해두고
 * 응답이 도착했을 때 값이 달라졌으면 캐시에 담지 않는다.
 * 로그아웃 직전에 나간 요청의 응답이 다음 계정에게 그대로 제공되는 것을 막는다.
 */
let generation = 0

export function invalidateCache(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key)
  }
  for (const key of inflight.keys()) {
    if (key.startsWith(prefix)) inflight.delete(key)
  }
  generation++
}

/**
 * 키 하나만 정확히 버린다. 접두사 무효화는 `todo:1`이 `todo:12`까지 지우므로,
 * 특정 항목이 바뀐 걸 아는 경로에서는 이쪽을 쓴다.
 */
export function invalidateCacheKey(key: string): void {
  store.delete(key)
  inflight.delete(key)
  generation++
}

export function clearAllCache(): void {
  store.clear()
  inflight.clear()
  generation++
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

  const startedAt = generation

  const promise: Promise<T> = fetcher()
    .then((data) => {
      // 무효화가 inflight에서 걷어낸 뒤 새 요청이 자리를 잡았을 수 있어, 내 것일 때만 지운다
      if (inflight.get(key) === promise) inflight.delete(key)
      if (startedAt === generation) {
        store.set(key, { data, expiresAt: Date.now() + ttlMs })
      }
      return data
    })
    .catch((err) => {
      if (inflight.get(key) === promise) inflight.delete(key)
      throw err
    })

  inflight.set(key, promise)
  return promise
}
