'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/services/notificationService'
import type { AppNotification } from '@/types/notification.types'

function getSockJsUrl(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'
  return apiBase + '/ws'
}

export function useNotifications(token: string | null) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [hasNext, setHasNext] = useState(false)
  const [nextCursorId, setNextCursorId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const clientRef = useRef<Client | null>(null)

  // Fetch initial unread count
  useEffect(() => {
    if (!token) return
    getUnreadNotificationCount(token)
      .then(setUnreadCount)
      .catch(() => {})
  }, [token])

  // WebSocket for real-time notifications
  useEffect(() => {
    if (!token) return

    const client = new Client({
      webSocketFactory: () => new SockJS(getSockJsUrl()),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/user/queue/notifications', () => {
          setUnreadCount((prev) => prev + 1)
        })
      },
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
    }
  }, [token])

  const loadNotifications = useCallback(
    async (reset = false) => {
      if (!token) return
      setIsLoading(true)
      try {
        const cursorId = reset ? undefined : (nextCursorId ?? undefined)
        const res = await getNotifications(token, cursorId)
        setNotifications((prev) => (reset ? res.notifications : [...prev, ...res.notifications]))
        setHasNext(res.hasNext)
        setNextCursorId(res.nextCursorId)
      } catch {
        // silently fail
      } finally {
        setIsLoading(false)
      }
    },
    [token, nextCursorId]
  )

  const markRead = useCallback(
    async (id: number) => {
      if (!token) return
      try {
        await markNotificationRead(id, token)
        setNotifications((prev) =>
          prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch {
        // silently fail
      }
    },
    [token]
  )

  const markAllRead = useCallback(async () => {
    if (!token) return
    try {
      await markAllNotificationsRead(token)
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {
      // silently fail
    }
  }, [token])

  return {
    unreadCount,
    notifications,
    hasNext,
    isLoading,
    loadNotifications,
    markRead,
    markAllRead,
  }
}
