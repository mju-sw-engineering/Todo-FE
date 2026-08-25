export type TodoStatus = 'IN_PROGRESS' | 'SUCCESS' | 'FAIL'
export type TodoMode = 'DIRECT' | 'TASK'
export type WorkItemStatus = 'IN_PROGRESS' | 'SUCCESS' | 'FAIL'
export type ReactionType = 'LIKE' | 'HEART' | 'SURPRISED' | 'DISLIKE' | 'ANGRY'

export type SubmissionKind = 'IMAGE' | 'DOCUMENT' | null

export type AiAnalysisStatus = 'PENDING' | 'DONE' | 'FAILED'
export type AiAnalysisVerdict = 'VERIFIED' | 'MISMATCH' | 'UNCERTAIN'

export interface AiAnalysis {
  status: AiAnalysisStatus
  verdict: AiAnalysisVerdict | null
  /** 팀 전체에 공개되는 한 줄 요약 */
  summary: string | null
  /** 제출자 본인에게만 내려옴. 그 외에는 항상 null */
  mismatchReason: string | null
}

export interface MyWorkSummary {
  totalCount: number
  successCount: number
  failCount: number
  inProgressCount: number
}

/**
 * 목록 응답에 실려오는 담당자 요약. 미배정 WorkItem은 BE에서 제외되므로 여기 없다.
 *
 * status는 한 사람이 맡은 WorkItem들을 종합한 값이다 —
 * 하나라도 진행 중이면 IN_PROGRESS, 아니면 하나라도 실패 시 FAIL, 전부 성공일 때만 SUCCESS.
 */
export interface TodoParticipant {
  userId: number
  nickname: string
  profileImageUrl: string | null
  status: WorkItemStatus
  successCount: number
  totalCount: number
}

export interface Todo {
  todoId: number
  mode: TodoMode
  title: string
  description: string | null
  deadline: string
  status: TodoStatus
  achievementCount: string
  participants: TodoParticipant[]
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
  /** 판정 대상이 아닌 제출(hwp 등)이면 null */
  aiAnalysis: AiAnalysis | null
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
  /** 원본 파일명, 255자 이하. 오브젝트 키는 UUID라 사람이 못 알아본다 */
  proofFileName?: string
}

export interface ReactRequest {
  type: ReactionType
}

export interface TodoWorkItemSubmission {
  workItemId: number
  assigneeId: number | null
  submittedAt: string
  /** null이면 메타데이터 도입 이전 제출분 — 종류를 단정하지 말 것 */
  kind: SubmissionKind
  fileName: string
  contentType: string
  originalUrl: string
  /** 이미지 제출에만 존재. 문서는 null */
  thumbnailUrl: string | null
  /** 마감 전 재제출로 파일이 갱신된 적이 있으면 true, 최초 제출 그대로면 false */
  resubmitted: boolean
  expiresAt: string
  /** 판정 대상이 아니면 null */
  aiAnalysis: AiAnalysis | null
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

/** 캘린더·주간 스트립이 날짜 하나를 그리는 데 필요한 최소 정보 */
export interface DayStat {
  total: number
  /** 아직 지나지 않은 날은 BE가 null을 준다 — 성공률 색 대신 '예정' 표시로 쓴다 */
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
