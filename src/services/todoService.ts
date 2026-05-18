import { getJson, postJson } from '@/lib/apiClient'
import type {
  CreateTodoRequest,
  CreateTodoResponse,
  SubmitTodoRequest,
  Todo,
  TodoDetail,
  TodayTodoListResponse,
} from '@/types/todo.types'

export async function getTodayTodos(teamId: number, token: string): Promise<Todo[]> {
  const data = await getJson<TodayTodoListResponse>(`/api/teams/${teamId}/todos`, token)
  return data ?? []
}

export async function getTodoDetail(todoId: number, token: string): Promise<TodoDetail> {
  return getJson<TodoDetail>(`/api/todos/${todoId}`, token)
}

export async function createTodo(
  teamId: number,
  request: CreateTodoRequest,
  token: string
): Promise<CreateTodoResponse> {
  return postJson<CreateTodoResponse>(`/api/teams/${teamId}/todos`, request, token)
}

export async function submitTodo(
  todoId: number,
  request: SubmitTodoRequest,
  token: string
): Promise<void> {
  return postJson<void>(`/api/todos/${todoId}/submit`, request, token)
}
