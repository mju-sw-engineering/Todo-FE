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

/** 슬래시 자동완성 목록 — text를 그대로 보내면 서버가 명령어로 인식한다 */
export const CHAT_COMMAND_LIST: {
  command: ChatCommand
  text: string
  label: string
  description: string
}[] = [
  {
    command: 'DEADLINE_APPROACHING',
    text: '/마감임박',
    label: '마감임박',
    description: '30분 안에 마감인 할 일과 아직 안 끝난 담당자를 보여줘요',
  },
  {
    command: 'TEAM_STATUS',
    text: '/팀현황',
    label: '팀현황',
    description: '진행중·성공·실패 개수와 진행중인 할 일 현황을 보여줘요',
  },
  {
    command: 'TODO_RECOMMENDATION',
    text: '/할일추천',
    label: '할일추천',
    description: '팀 활동을 분석해서 새로 할 만한 일을 추천해줘요',
  },
]

export function parseChatCommand(content: string): ChatCommand | null {
  return COMMAND_BY_TEXT[content.trim()] ?? null
}
