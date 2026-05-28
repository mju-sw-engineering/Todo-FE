export interface ChatRequest {
  message: string
  teamId: number
}

export interface ChatResponse {
  reply: string
}

export interface ChatMessage {
  role: 'user' | 'bot'
  content: string
  time: Date
}

export interface TodoChatMessage {
  messageId: number
  senderId: number
  senderNickname: string
  senderProfileImageUrl: string | null
  content: string
  createdAt: string
}

export interface TodoChatMessagesResponse {
  messages: TodoChatMessage[]
  nextCursorId: number | null
  hasNext: boolean
}

export interface TodoChatSendRequest {
  content: string
}
