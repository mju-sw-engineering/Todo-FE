export interface AppNotification {
  notificationId: number
  type: string
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
