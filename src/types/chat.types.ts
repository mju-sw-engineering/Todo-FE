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

export interface TeamChatMessage {
  messageId: number
  senderId: number | null
  senderNickname: string
  senderProfileImageUrl: string | null
  content: string
  createdAt: string
}

export interface TeamChatMessagesResponse {
  messages: TeamChatMessage[]
  nextCursorId: number | null
  hasNext: boolean
}
