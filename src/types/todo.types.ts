export type TodoStatus = 'IN_PROGRESS' | 'SUCCESS' | 'FAIL'
export type MyTodoStatus = '미완료' | '완료' | '평가 대기중'

export interface Todo {
  todoId: number
  title: string
  deadline: string
  creatorNickname: string
  status: TodoStatus
  achievementCount: string
  myStatus: MyTodoStatus
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
