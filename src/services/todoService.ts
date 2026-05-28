import { getJson, postJson } from '@/lib/apiClient'
import { cachedRequest, invalidateCache } from '@/lib/requestCache'
import type {
  CreateTodoRequest,
  CreateTodoResponse,
  ReactRequest,
  ReactionType,
  SubmitTodoRequest,
  Todo,
  TodoDetail,
  TodayTodoListResponse,
} from '@/types/todo.types'

export async function getTodayTodos(teamId: number, token: string): Promise<Todo[]> {
  return cachedRequest(
    `todos:${teamId}`,
    () => getJson<TodayTodoListResponse>(`/api/teams/${teamId}/todos`, token).then((d) => d ?? []),
    30_000
  )
}

export async function getTodoDetail(todoId: number, token: string): Promise<TodoDetail> {
  return cachedRequest(
    `todo:${todoId}`,
    () => getJson<TodoDetail>(`/api/todos/${todoId}`, token),
    15_000
  )
}

export async function createTodo(
  teamId: number,
  request: CreateTodoRequest,
  token: string
): Promise<CreateTodoResponse> {
  const result = await postJson<CreateTodoResponse>(`/api/teams/${teamId}/todos`, request, token)
  invalidateCache(`todos:${teamId}`)
  return result
}

export async function submitTodo(
  todoId: number,
  request: SubmitTodoRequest,
  token: string
): Promise<void> {
  await postJson<void>(`/api/todos/${todoId}/submit`, request, token)
  invalidateCache(`todo:${todoId}`)
  invalidateCache('todos:')
}

export async function postReaction(
  participantId: number,
  type: ReactionType,
  token: string
): Promise<void> {
  const request: ReactRequest = { type }
  await postJson<void>(`/api/todo-participants/${participantId}/reactions`, request, token)
  invalidateCache('todo:')
}
