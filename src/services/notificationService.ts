import { getJson, patchJson } from '@/lib/apiClient'
import type { AppNotification, NotificationsResponse } from '@/types/notification.types'

export async function getNotifications(
  token: string,
  cursorId?: number,
  size = 20
): Promise<NotificationsResponse> {
  const params = new URLSearchParams({ size: String(size) })
  if (cursorId != null) params.set('cursorId', String(cursorId))
  return getJson<NotificationsResponse>(`/api/notifications?${params}`, token)
}

export async function getUnreadNotificationCount(token: string): Promise<number> {
  const res = await getJson<{ unreadCount: number }>('/api/notifications/unread-count', token)
  return res.unreadCount
}

export async function markNotificationRead(id: number, token: string): Promise<void> {
  return patchJson<void>(`/api/notifications/${id}/read`, {}, token)
}

export async function markAllNotificationsRead(token: string): Promise<void> {
  return patchJson<void>('/api/notifications/read-all', {}, token)
}

export type { AppNotification }
