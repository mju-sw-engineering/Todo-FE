export type TodoStatus = 'IN_PROGRESS' | 'SUCCESS' | 'FAIL'
export type MyTodoStatus = '미완료' | '완료'
export type ReactionType = 'LIKE' | 'HEART' | 'SURPRISED' | 'DISLIKE' | 'ANGRY'

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

export interface Reaction {
  type: ReactionType
  emoji: string
  count: number
}

export interface TodoParticipant {
  userId: number
  todoParticipantId: number
  nickname: string
  profileImageUrl: string | null
  proofImageUrl: string | null
  proofThumbnailUrl?: string | null
  status: MyTodoStatus | null
  reactions: Reaction[]
  myReaction: ReactionType | null
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

export interface ReactRequest {
  type: ReactionType
}
