import { getJson } from '@/lib/apiClient'
import type { ChatRequest, ChatResponse, TodoChatMessagesResponse } from '@/types/chat.types'

const AI_BASE_URL = 'https://ai.swe.bluerack.org'

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

export async function getTodoChatMessages(
  todoId: number,
  token: string,
  cursorId?: number,
  size = 20
): Promise<TodoChatMessagesResponse> {
  const params = new URLSearchParams({ size: String(size) })
  if (cursorId != null) params.set('cursorId', String(cursorId))
  return getJson<TodoChatMessagesResponse>(`/api/todos/${todoId}/chat/messages?${params}`, token)
}
