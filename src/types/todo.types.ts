export type TodoStatus = 'IN_PROGRESS' | 'SUCCESS' | 'FAIL'
export type MyTodoStatus = 'COMPLETED' | 'PENDING' | 'INCOMPLETE'

export interface Todo {
  todoId: number
  teamId: number
  title: string
  deadline: string
  description: string | null
  creatorNickname: string
  status: TodoStatus
  myStatus: MyTodoStatus
  achievedCount: number
  totalCount: number
}

export interface TodayTodoListResponse {
  todos: Todo[]
}

export interface CreateTodoRequest {
  teamId: number
  title: string
  deadline: string
  description?: string
  memberIds: number[]
}

export interface CreateTodoResponse {
  todoId: number
}
