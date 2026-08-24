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

/** 현재 결과 조회가 붙어 있는 명령어. /내할일은 핸들러가 없어 아직 뺀다 */
export type ChatCommand = 'DEADLINE_APPROACHING' | 'TEAM_STATUS' | 'TODO_RECOMMENDATION'

export type ChatCommandResultStatus = 'PENDING' | 'DONE' | 'FAILED'

export interface DeadlineApproachingTodo {
  todoId: number
  title: string
  deadline: string
  pendingAssigneeNicknames: string[]
}

export interface DeadlineApproachingResult {
  todos: DeadlineApproachingTodo[]
}

export interface TeamStatusInProgressTodo {
  todoId: number
  title: string
  completedWorkItemCount: number
  totalWorkItemCount: number
}

export interface TeamStatusResult {
  inProgressCount: number
  successCount: number
  failCount: number
  inProgressTodos: TeamStatusInProgressTodo[]
}

export interface TodoRecommendationItem {
  title: string
  description: string | null
  deadline: string | null
  assigneeId: number | null
}

/**
 * 핸들러가 결과를 거부할 수 없어 기능 꺼짐·쿨다운·기록 없음도 예외가 아니라
 * outcome의 한 종류로 돌아온다. RECOMMENDED가 아니면 items는 없다고 본다.
 */
export type RecommendationOutcome = 'RECOMMENDED' | 'REUSED' | string

export interface TodoRecommendationResult {
  outcome: RecommendationOutcome
  items: TodoRecommendationItem[] | null
  message: string | null
}

export type ChatCommandResultOf<C extends ChatCommand> = C extends 'DEADLINE_APPROACHING'
  ? DeadlineApproachingResult
  : C extends 'TEAM_STATUS'
    ? TeamStatusResult
    : TodoRecommendationResult

export interface ChatCommandResult<C extends ChatCommand = ChatCommand> {
  command: C
  status: ChatCommandResultStatus
  result: ChatCommandResultOf<C> | null
}
