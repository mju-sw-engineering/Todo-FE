import type { ChatCommand } from '@/types/chat.types'

/** 채팅 명령어 문자열 → command 값. 서버는 content가 이 문자열과 정확히 일치하는지만 본다 */
const COMMAND_BY_TEXT: Record<string, ChatCommand> = {
  '/마감임박': 'DEADLINE_APPROACHING',
  '/팀현황': 'TEAM_STATUS',
  '/할일추천': 'TODO_RECOMMENDATION',
}

export const CHAT_COMMAND_LABEL: Record<ChatCommand, string> = {
  DEADLINE_APPROACHING: '마감임박',
  TEAM_STATUS: '팀현황',
  TODO_RECOMMENDATION: '할일추천',
}

export function parseChatCommand(content: string): ChatCommand | null {
  return COMMAND_BY_TEXT[content.trim()] ?? null
}
