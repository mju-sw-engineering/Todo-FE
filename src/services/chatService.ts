import { getJson, patchJson, postJson } from '@/lib/apiClient'
import type {
  ChatCommand,
  ChatCommandResult,
  ChatRequest,
  ChatResponse,
  TeamChatMessagesResponse,
} from '@/types/chat.types'

const AI_BASE_URL = 'https://ai.todo.bluerack.org'

export async function sendChatMessage(request: ChatRequest, token: string): Promise<string> {
  const response = await fetch(`${AI_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Chat API error: ${response.status}`)
  }

  const data: ChatResponse = await response.json()
  return data.reply
}

export async function getTeamChatMessages(
  teamId: number,
  token: string,
  cursorId?: number,
  size = 20
): Promise<TeamChatMessagesResponse> {
  const params = new URLSearchParams({ size: String(size) })
  if (cursorId != null) params.set('cursorId', String(cursorId))
  return getJson<TeamChatMessagesResponse>(`/api/teams/${teamId}/chat/messages?${params}`, token)
}

export async function markTeamChatRead(
  teamId: number,
  lastReadMessageId: number,
  token: string
): Promise<void> {
  return patchJson<void>(`/api/teams/${teamId}/chat/read`, { lastReadMessageId }, token)
}

export async function getTeamUnreadChatCount(teamId: number, token: string): Promise<number> {
  const res = await getJson<{ unreadCount: number }>(
    `/api/teams/${teamId}/chat/unread-count`,
    token
  )
  return res.unreadCount
}

/**
 * 채팅 메시지의 명령어 실행 결과를 조회한다. 개인용 명령어는 실행자 본인만 조회
 * 가능(그 외 403), 명령어가 아니거나 등록된 핸들러가 없으면 404를 던진다.
 */
export async function getChatCommandResult<C extends ChatCommand>(
  teamId: number,
  messageId: number,
  token: string
): Promise<ChatCommandResult<C>> {
  return getJson<ChatCommandResult<C>>(
    `/api/teams/${teamId}/chat/messages/${messageId}/command-result`,
    token
  )
}

/**
 * /할일추천 카드의 [등록] 버튼. 서버가 실행 행을 잠그고 처리하므로 동시 클릭 시
 * 두 번째 요청은 409로 떨어진다 — 호출부에서 "이미 등록됨"으로 처리할 것.
 */
export async function registerTodoRecommendationItem(
  teamId: number,
  messageId: number,
  index: number,
  token: string
): Promise<void> {
  return postJson<void>(
    `/api/teams/${teamId}/chat/messages/${messageId}/todo-recommendation/items/${index}/register`,
    {},
    token
  )
}
