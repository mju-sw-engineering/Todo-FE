export type NotificationType = 'CHAT_MESSAGE' | 'TODO_CREATED' | 'TODO_ASSIGNED' | 'TODO_UNASSIGNED'

export interface AppNotification {
  notificationId: number
  type: NotificationType
  title: string
  content: string
  isRead: boolean
  referenceId: number
  createdAt: string
}

export interface NotificationsResponse {
  notifications: AppNotification[]
  nextCursorId: number | null
  hasNext: boolean
}
