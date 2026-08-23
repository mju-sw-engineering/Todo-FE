export type NotificationType =
  | 'CHAT_MESSAGE'
  | 'TODO_CREATED'
  | 'TODO_ASSIGNED'
  | 'TODO_UNASSIGNED'
  | 'TODO_SUBMITTED'
  | 'TODO_DEADLINE_APPROACHING'
  | 'TODO_WORK_ITEM_EXPIRED'
  | 'TODO_REACTION_ADDED'
  | 'TODO_ALL_COMPLETED'
  | 'AI_PROOF_MISMATCH'
  | 'TEAM_MEMBER_JOINED'
  | 'TEAM_MEMBER_LEFT'
  | 'TEAM_MEMBER_REMOVED'
  | 'TEAM_LEADER_CHANGED'
  | 'NEW_DEVICE_LOGIN'
  | 'PASSWORD_CHANGED'
  | 'AVAILABILITY_POLL_CREATED'

/** referenceId가 가리키는 대상의 종류. 백엔드가 알림 타입에서 파생해 내려준다. */
export type ReferenceType = 'TODO' | 'TEAM' | 'CHAT' | 'AVAILABILITY_POLL' | 'NONE'

export interface AppNotification {
  notificationId: number
  type: NotificationType
  referenceType: ReferenceType
  title: string
  content: string
  isRead: boolean
  /**
   * TODO면 todoId, TEAM·CHAT이면 teamId, AVAILABILITY_POLL이면 eventId(pollId), NONE이면 null.
   * 단 AI_PROOF_MISMATCH는 referenceType이 TODO여도 todoId가 아니라 workItemId다.
   */
  referenceId: number | null
  /** 알림이 속한 팀. 팀 무관 알림(NONE)이거나 백필 시점에 대상이 삭제된 과거 알림이면 null */
  teamId: number | null
  createdAt: string
}

export interface NotificationsResponse {
  notifications: AppNotification[]
  nextCursorId: number | null
  hasNext: boolean
}
