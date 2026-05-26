export type TodoStatus = 'IN_PROGRESS' | 'SUCCESS' | 'FAIL'
export type MyTodoStatus = '미완료' | '완료' | '평가 대기중'

export interface Todo {
  todoId: number
  title: string
  deadline: string
  creatorNickname: string
  status: TodoStatus
  achievementCount: string
  myStatus: MyTodoStatus | null
}

export type TodayTodoListResponse = Todo[] | null

export interface CreateTodoRequest {
  title: string
  description?: string
  deadline: string
  assigneeIds: number[]
}

export interface CreateTodoResponse {
  todoId: number
  teamId: number
  creatorId: number
  title: string
  description: string | null
  deadline: string
  status: TodoStatus
  assigneeIds: number[]
  createdAt: string
}

export interface TodoParticipant {
  userId: number
  nickname: string
  profileImageUrl: string | null
  proofImageUrl: string | null
  status: MyTodoStatus | null
}

export interface TodoDetail {
  todoId: number
  title: string
  deadline: string
  creatorNickname: string
  status: TodoStatus
  achievementCount: string
  myStatus?: MyTodoStatus | null
  description: string | null
  participants: TodoParticipant[]
}

export interface SubmitTodoRequest {
  proofImageKey: string
}

export interface EvaluateRequest {
  targetUserId: number
  voteType: 'POSITIVE' | 'NEGATIVE'
}
