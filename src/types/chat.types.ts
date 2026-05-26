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
