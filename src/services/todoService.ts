import { getJson, postJson } from '@/lib/apiClient'
import type {
  CreateTodoRequest,
  CreateTodoResponse,
  Todo,
  TodayTodoListResponse,
} from '@/types/todo.types'

export async function getTodayTodos(teamId: number, token: string): Promise<Todo[]> {
  const data = await getJson<TodayTodoListResponse>(`/api/teams/${teamId}/todos`, token)
  return data ?? []
}

export async function createTodo(
  teamId: number,
  request: CreateTodoRequest,
  token: string
): Promise<CreateTodoResponse> {
  return postJson<CreateTodoResponse>(`/api/teams/${teamId}/todos`, request, token)
}
