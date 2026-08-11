import { getAuthBridge } from '@/lib/authBridge'
import type { ApiResponse } from '@/types/auth.types'

/**
 * 프록시 모드에서는 같은 오리진으로 요청한다. `SameSite=Strict`인 리프레시 쿠키를
 * 로컬에서 쓰기 위한 개발용 설정이며, 배경은 `next.config.ts` 참조.
 *
 * WebSocket(SockJS)은 이 값을 쓰지 않는다. 쿠키가 필요 없고 Next rewrite가 업그레이드를
 * 프록시하지도 못하므로 `NEXT_PUBLIC_API_URL`로 계속 직접 연결한다.
 */
const BASE_URL =
  process.env.NEXT_PUBLIC_USE_API_PROXY === 'true'
    ? ''
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080')

const REFRESH_PATH = '/api/auth/refresh'

/**
 * 401을 받아도 토큰 갱신을 시도하지 않는 경로.
 *
 * 로그인·회원가입의 401은 자격 증명이 틀린 것이라 갱신해도 소용없고,
 * 갱신 경로 자체에서 재시도하면 무한 루프가 된다.
 *
 * 로그아웃은 일부러 뺐다. 서버에서 인증이 필요한 경로인데, 액세스 토큰이 만료된 채
 * 로그아웃하면 401로 끝나 쿠키가 서버에 남는다. 갱신 후 재시도해야 쿠키까지 정리된다.
 */
const NO_REFRESH_PATHS = [REFRESH_PATH, '/api/auth/login', '/api/auth/signup']

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text()
  if (!text) {
    if (!response.ok) throw new ApiError('요청에 실패했습니다.', response.status)
    return undefined as T
  }
  const json: ApiResponse<T> = JSON.parse(text)
  if (!response.ok || !json.success) {
    throw new ApiError(json.message ?? '요청에 실패했습니다.', response.status)
  }
  return json.data
}

/**
 * 진행 중인 갱신 요청. 여러 요청이 동시에 401을 받아도 갱신은 한 번만 나간다.
 *
 * 없으면 한 화면에서 목록·알림·프로필이 동시에 만료돼 refresh가 세 번 나가고,
 * 서버가 토큰을 회전시키므로 마지막 것만 유효해져 나머지가 로그아웃된다.
 */
let refreshInFlight: Promise<string | null> | null = null

/**
 * 갱신이 이미 실패해 재로그인이 필요한 상태.
 *
 * 단일 비행은 동시에 도착한 401만 묶는다. 첫 갱신이 끝난 뒤 뒤늦게 401을 받은 요청은
 * 새 갱신을 시작하므로, 세션이 끊긴 화면에서 요청 수만큼 refresh가 나간다.
 * 한 번 실패했으면 새로 로그인하기 전까지 다시 시도하지 않는다.
 */
let authExpired = false

/** 로그인으로 새 세션이 생기면 갱신을 다시 허용한다. */
export function resetAuthFailureState(): void {
  authExpired = false
}

async function requestRefresh(): Promise<string | null> {
  try {
    const response = await fetch(`${BASE_URL}${REFRESH_PATH}`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!response.ok) return null

    const text = await response.text()
    if (!text) return null

    const json: ApiResponse<{ accessToken: string }> = JSON.parse(text)
    if (!json.success || !json.data?.accessToken) return null

    return json.data.accessToken
  } catch {
    // 네트워크 오류는 만료와 구분되지 않으므로 갱신 실패로 본다.
    return null
  }
}

function refreshAccessToken(): Promise<string | null> {
  if (authExpired) return Promise.resolve(null)

  if (!refreshInFlight) {
    refreshInFlight = requestRefresh()
      .then((token) => {
        const bridge = getAuthBridge()
        if (token) {
          bridge?.onTokenRefreshed(token)
        } else {
          authExpired = true
          bridge?.onAuthExpired()
        }
        return token
      })
      .finally(() => {
        refreshInFlight = null
      })
  }
  return refreshInFlight
}

function withAuth(headers: Record<string, string>, token?: string): Record<string, string> {
  if (!token) return headers
  return { ...headers, Authorization: `Bearer ${token}` }
}

interface RequestOptions {
  method: string
  headers?: Record<string, string>
  body?: BodyInit
}

/**
 * 액세스 토큰 만료를 자동으로 회복하는 요청.
 *
 * 401을 받으면 리프레시 쿠키로 새 토큰을 받아 원 요청을 한 번만 재시도한다.
 * 재시도까지 401이면 그대로 예외를 던져 호출부가 처리하게 둔다.
 *
 * 리프레시 토큰은 httpOnly 쿠키라 JS가 읽을 수 없으므로 `credentials: 'include'`가
 * 필수다. 이게 없으면 브라우저가 쿠키를 아예 싣지 않는다.
 */
async function request<T>(path: string, options: RequestOptions, token?: string): Promise<T> {
  const send = (accessToken?: string) =>
    fetch(`${BASE_URL}${path}`, {
      method: options.method,
      headers: withAuth(options.headers ?? {}, accessToken),
      body: options.body,
      credentials: 'include',
    })

  const response = await send(token)
  if (response.status !== 401 || NO_REFRESH_PATHS.includes(path)) {
    return handleResponse<T>(response)
  }

  // 호출부가 넘긴 토큰이 이미 낡았을 수 있다. 컴포넌트가 아직 리렌더되지 않아 옛 토큰을
  // 들고 있는 경우인데, 이때 갱신을 또 부르면 서버가 리프레시 토큰을 불필요하게 회전시킨다.
  const current = getAuthBridge()?.getToken()
  if (current && current !== token) {
    return handleResponse<T>(await send(current))
  }

  const refreshed = await refreshAccessToken()
  if (!refreshed) {
    return handleResponse<T>(response)
  }
  return handleResponse<T>(await send(refreshed))
}

export async function postJson<T>(path: string, body: unknown, token?: string): Promise<T> {
  return request<T>(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    token
  )
}

export async function postForm<T>(path: string, formData: FormData, token?: string): Promise<T> {
  return request<T>(path, { method: 'POST', body: formData }, token)
}

export async function getJson<T>(path: string, token?: string): Promise<T> {
  return request<T>(path, { method: 'GET' }, token)
}

export async function patchJson<T>(path: string, body: unknown, token?: string): Promise<T> {
  return request<T>(
    path,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    token
  )
}

export async function putJson<T>(path: string, body: unknown, token?: string): Promise<T> {
  return request<T>(
    path,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    token
  )
}

export async function deleteJson<T>(path: string, token?: string, body?: unknown): Promise<T> {
  return request<T>(
    path,
    {
      method: 'DELETE',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    },
    token
  )
}

// MinIO presigned URL에 직접 PUT — Authorization 헤더 없음 (서명 깨짐 방지).
// credentials도 붙이지 않는다. 스토리지는 우리 쿠키를 받을 이유가 없고
// 인증 실패 시 갱신 대상도 아니다.
export async function putFile(url: string, file: File): Promise<void> {
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!response.ok) {
    throw new ApiError('파일 업로드에 실패했습니다.', response.status)
  }
}
