export type TodoStatus = 'IN_PROGRESS' | 'SUCCESS' | 'FAIL'
export type TodoMode = 'DIRECT' | 'TASK'
export type WorkItemStatus = 'IN_PROGRESS' | 'SUCCESS' | 'FAIL'
export type ReactionType = 'LIKE' | 'HEART' | 'SURPRISED' | 'DISLIKE' | 'ANGRY'

export interface MyWorkSummary {
  totalCount: number
  successCount: number
  failCount: number
  inProgressCount: number
}

export interface Todo {
  todoId: number
  mode: TodoMode
  title: string
  deadline: string
  status: TodoStatus
  achievementCount: string
  myWorkSummary: MyWorkSummary
}

export type TodayTodoListResponse = Todo[] | null

export type TodoActiveStatusFilter = 'PENDING' | 'DONE'

export interface TodoActivePageResponse {
  todos: Todo[]
  hasNext: boolean
  nextCursor: string | null
}

export interface CreateTodoTaskRequest {
  title: string
  description?: string
  assigneeId: number
  deadline: string
}

interface CreateTodoBaseRequest {
  title: string
  description?: string
  deadline: string
}

export type CreateTodoRequest = CreateTodoBaseRequest &
  (
    | { assigneeIds: number[]; tasks?: never }
    | { assigneeIds?: never; tasks: CreateTodoTaskRequest[] }
  )

export interface CreateTodoResponse {
  todoId: number
  mode: TodoMode
  title: string
  deadline: string
  status: TodoStatus
  directAssignees: TodoDirectAssignee[] | null
  tasks: TodoTask[] | null
}

export type ReactionCounts = Partial<Record<ReactionType, number>>

export interface TodoWorkItemBase {
  workItemId: number
  assigneeId: number | null
  assigneeNickname: string | null
  status: WorkItemStatus
  submittedAt: string | null
  thumbnailUrl: string | null
  reactions: ReactionCounts
  myReaction: ReactionType | null
  unassigned: boolean
}

export type TodoDirectAssignee = TodoWorkItemBase

export interface TodoTask extends TodoWorkItemBase {
  title: string
  description: string | null
  deadline: string
  position: number
}

export type TodoWorkItem = TodoDirectAssignee | TodoTask

export interface TodoDetail {
  todoId: number
  mode: TodoMode
  title: string
  deadline: string
  creatorNickname: string
  status: TodoStatus
  achievementCount: string
  description: string | null
  directAssignees: TodoDirectAssignee[] | null
  tasks: TodoTask[] | null
}

export interface SubmitTodoRequest {
  proofImageKey: string
}

export interface ReactRequest {
  type: ReactionType
}

export interface TodoWorkItemSubmission {
  workItemId: number
  assigneeId: number | null
  submittedAt: string
  originalUrl: string
  thumbnailUrl: string
  expiresAt: string
}

export interface TodoWorkItemAssignee {
  workItemId: number
  assigneeId: number
  assigneeNickname: string
  status: WorkItemStatus
}

export interface DailyTodoStat {
  date: string
  totalTodoCount: number
  successCount: number
  failCount: number
  inProgressCount: number
  achievementRate: number | null
}

export interface TodoWithTeam extends Todo {
  teamId: number
  teamName: string
  teamImageUrl: string | null
}

export interface TodoPeriodReportResponse {
  period: {
    startDate: string
    endDate: string
    dateCount: number
  }
  summary: {
    totalTodoCount: number
    successCount: number
    failCount: number
    inProgressCount: number
    achievementRate: number | null
  }
  weakestDay: string | null
  dailyStats: DailyTodoStat[]
  actionCandidates: unknown[]
}

export function isMyWorkComplete(summary: MyWorkSummary): boolean {
  return summary.totalCount > 0 && summary.successCount === summary.totalCount
}
