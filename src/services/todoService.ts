import { getJson, patchJson, postJson } from '@/lib/apiClient'
import { cachedRequest, invalidateCache, invalidateCacheKey } from '@/lib/requestCache'
import type {
  CreateTodoRequest,
  CreateTodoResponse,
  ReactRequest,
  ReactionType,
  SubmitTodoRequest,
  Todo,
  TodoActivePageResponse,
  TodoActiveStatusFilter,
  TodoDetail,
  TodoPeriodReportResponse,
  TodoWorkItemAssignee,
  TodoWorkItemSubmission,
  TodayTodoListResponse,
} from '@/types/todo.types'

export async function getTodayTodos(teamId: number, token: string): Promise<Todo[]> {
  return cachedRequest(
    `todos:${teamId}`,
    () => getJson<TodayTodoListResponse>(`/api/teams/${teamId}/todos`, token).then((d) => d ?? []),
    30_000
  )
}

export async function getTodoDetail(
  todoId: number,
  token: string,
  options?: { force?: boolean }
): Promise<TodoDetail> {
  const key = `todo:${todoId}`
  // AI 판정 푸시처럼 "방금 값이 바뀌었다"는 신호를 받은 경로는 캐시를 건너뛰어야 한다.
  // TTL 안에 재조회하면 판정 전 응답이 그대로 돌아와 뱃지가 영영 붙지 않는다.
  if (options?.force) invalidateCacheKey(key)
  return cachedRequest(key, () => getJson<TodoDetail>(`/api/todos/${todoId}`, token), 15_000)
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

export async function submitTodoWorkItem(
  workItemId: number,
  request: SubmitTodoRequest,
  token: string
): Promise<void> {
  await postJson<void>(`/api/todo-work-items/${workItemId}/submission`, request, token)
  invalidateCache('todo:')
  invalidateCache('todos:')
}

export async function getTodoWorkItemSubmission(
  workItemId: number,
  token: string
): Promise<TodoWorkItemSubmission> {
  return getJson<TodoWorkItemSubmission>(`/api/todo-work-items/${workItemId}/submission`, token)
}

export async function postReaction(
  workItemId: number,
  type: ReactionType,
  token: string
): Promise<void> {
  const request: ReactRequest = { type }
  await postJson<void>(`/api/todo-work-items/${workItemId}/reactions`, request, token)
  invalidateCache('todo:')
}

export async function reassignTodoWorkItem(
  workItemId: number,
  assigneeId: number,
  token: string
): Promise<TodoWorkItemAssignee> {
  const result = await patchJson<TodoWorkItemAssignee>(
    `/api/todo-work-items/${workItemId}/assignee`,
    { assigneeId },
    token
  )
  invalidateCache('todo:')
  invalidateCache('todos:')
  return result
}

export async function getActiveTodos(
  teamId: number,
  token: string,
  params?: { status?: TodoActiveStatusFilter; cursor?: string; size?: number }
): Promise<TodoActivePageResponse> {
  const query = new URLSearchParams()
  if (params?.status) query.set('status', params.status)
  if (params?.cursor) query.set('cursor', params.cursor)
  if (params?.size) query.set('size', String(params.size))
  const qs = query.toString()
  return getJson<TodoActivePageResponse>(
    `/api/teams/${teamId}/todos/active${qs ? `?${qs}` : ''}`,
    token
  )
}

export async function getAllActiveTodos(teamId: number, token: string): Promise<Todo[]> {
  const todos: Todo[] = []
  let cursor: string | undefined
  do {
    const page = await getActiveTodos(teamId, token, { cursor, size: 50 })
    todos.push(...page.todos)
    cursor = page.hasNext ? (page.nextCursor ?? undefined) : undefined
  } while (cursor)
  return todos
}

/**
 * 해당 날짜에 마감이 걸린 팀 전체 할 일. BE가 deadline 오름차순으로 주므로
 * 받은 순서가 곧 마감 임박순이다 — 클라이언트에서 다시 정렬하지 않는다.
 * 결과가 없으면 `data: null`이 오기 때문에 빈 배열로 정규화한다.
 *
 * 날짜를 앞뒤로 넘겨보는 화면이라 날짜별로 캐시한다.
 */
export async function getTodosByDate(teamId: number, date: string, token: string): Promise<Todo[]> {
  return cachedRequest(
    `todos:${teamId}:date:${date}`,
    () =>
      getJson<Todo[] | null>(`/api/teams/${teamId}/todos?date=${date}`, token).then((d) => d ?? []),
    30_000
  )
}

export async function getTeamTodoReport(
  teamId: number,
  startDate: string,
  endDate: string,
  token: string
): Promise<TodoPeriodReportResponse> {
  // 달을 앞뒤로 넘기면 같은 구간을 반복해서 부르게 되므로 구간 단위로 캐시한다.
  return cachedRequest(
    `todos:${teamId}:report:${startDate}:${endDate}`,
    () =>
      getJson<TodoPeriodReportResponse>(
        `/api/teams/${teamId}/todos/report?startDate=${startDate}&endDate=${endDate}`,
        token
      ),
    30_000
  )
}
