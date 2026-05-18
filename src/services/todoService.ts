import { getJson, postJson } from '@/lib/apiClient'
import type {
  CreateTodoRequest,
  CreateTodoResponse,
  TodayTodoListResponse,
} from '@/types/todo.types'

export async function getTodayTodos(teamId: number, token: string): Promise<TodayTodoListResponse> {
  return getJson<TodayTodoListResponse>(`/api/teams/${teamId}/todos`, token)
}

export async function createTodo(
  teamId: number,
  request: CreateTodoRequest,
  token: string
): Promise<CreateTodoResponse> {
  return postJson<CreateTodoResponse>(`/api/teams/${teamId}/todos`, request, token)
}
