import { getJson, patchJson, postJson } from '@/lib/apiClient'
import { cachedRequest, invalidateCache } from '@/lib/requestCache'
import type {
  CreateTodoRequest,
  CreateTodoResponse,
  ReactRequest,
  ReactionType,
  SubmitTodoRequest,
  Todo,
  TodoDetail,
  TodoPeriodReportResponse,
  TodoWorkItemAssignee,
  TodoWorkItemSubmission,
  TodayTodoListResponse,
  WorkItemCheckIn,
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

/** 진행 중인 본인 WorkItem에 오늘의 진행 메모를 남긴다. 하루 1번, 중복이면 409. */
export async function checkInWorkItem(
  workItemId: number,
  memo: string,
  token: string
): Promise<WorkItemCheckIn> {
  return postJson<WorkItemCheckIn>(`/api/todo-work-items/${workItemId}/check-ins`, { memo }, token)
}

export async function getWorkItemCheckIns(
  workItemId: number,
  token: string
): Promise<WorkItemCheckIn[]> {
  return getJson<WorkItemCheckIn[]>(`/api/todo-work-items/${workItemId}/check-ins`, token)
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

export async function getHistoryTodos(
  teamId: number,
  date: string,
  token: string
): Promise<Todo[]> {
  const data = await getJson<Todo[] | null>(`/api/teams/${teamId}/todos?date=${date}`, token)
  return data ?? []
}

export async function getTeamTodoReport(
  teamId: number,
  startDate: string,
  endDate: string,
  token: string
): Promise<TodoPeriodReportResponse> {
  return getJson<TodoPeriodReportResponse>(
    `/api/teams/${teamId}/todos/report?startDate=${startDate}&endDate=${endDate}`,
    token
  )
}
