import { getJson, patchJson } from '@/lib/apiClient'
import type { ChatRequest, ChatResponse, TeamChatMessagesResponse } from '@/types/chat.types'

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

// NOTE: mirrors the todo-chat REST contract (/api/todos/{todoId}/chat/*), which is confirmed
// to exist on the backend. The equivalent /api/teams/{teamId}/chat/* endpoints do NOT exist
// yet (checked via the live Swagger spec) — this is frontend groundwork ahead of the backend.
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
