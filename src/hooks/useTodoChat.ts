'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import { getTodoChatMessages } from '@/services/chatService'
import type { TodoChatMessage } from '@/types/chat.types'

function getWsUrl(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'
  return apiBase.replace(/^http/, 'ws') + '/ws'
}

let tempId = -1

export function useTodoChat(todoId: number, token: string | null) {
  const [messages, setMessages] = useState<TodoChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(!!token)
  const [hasNext, setHasNext] = useState(false)
  const [nextCursorId, setNextCursorId] = useState<number | null>(null)
  const clientRef = useRef<Client | null>(null)
  const seenIds = useRef(new Set<number>())

  // Load initial history
  useEffect(() => {
    if (!token) return
    getTodoChatMessages(todoId, token)
      .then((res) => {
        const ordered = res.messages.slice().reverse()
        ordered.forEach((m) => seenIds.current.add(m.chatId))
        setMessages(ordered)
        setHasNext(res.hasNext)
        setNextCursorId(res.nextCursorId)
      })
      .catch(() => null)
      .finally(() => setIsLoadingHistory(false))
  }, [todoId, token])

  // WebSocket connection
  useEffect(() => {
    if (!token) return

    const client = new Client({
      brokerURL: getWsUrl(),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      onConnect: () => {
        setIsConnected(true)
        client.subscribe(`/topic/todos/${todoId}`, (frame) => {
          try {
            const msg: TodoChatMessage = JSON.parse(frame.body)
            // Deduplicate: skip if already in seenIds (including optimistic messages with same chatId)
            if (seenIds.current.has(msg.chatId)) return
            seenIds.current.add(msg.chatId)
            // Replace optimistic placeholder if it matches (negative id slot)
            setMessages((prev) => {
              const idx = prev.findIndex((m) => m.chatId < 0 && m.content === msg.content)
              if (idx !== -1) {
                const next = [...prev]
                next[idx] = msg
                return next
              }
              return [...prev, msg]
            })
          } catch {
            // ignore malformed frames
          }
        })
      },
      onDisconnect: () => setIsConnected(false),
      onStompError: () => setIsConnected(false),
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
    }
  }, [todoId, token])

  const sendMessage = useCallback(
    (content: string, currentUser: { userId: number; nickname: string } | null) => {
      const client = clientRef.current
      if (!content.trim()) return

      // Optimistic insert
      const optimistic: TodoChatMessage = {
        chatId: tempId--,
        userId: currentUser?.userId ?? 0,
        nickname: currentUser?.nickname ?? '',
        profileImageUrl: null,
        content: content.trim(),
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, optimistic])

      if (client?.connected) {
        client.publish({
          destination: `/app/todos/${todoId}/chat`,
          body: JSON.stringify({ content: content.trim() }),
        })
      }
    },
    [todoId]
  )

  const loadMore = useCallback(async () => {
    if (!token || !hasNext || nextCursorId == null) return
    try {
      const res = await getTodoChatMessages(todoId, token, nextCursorId)
      const ordered = res.messages.slice().reverse()
      ordered.forEach((m) => seenIds.current.add(m.chatId))
      setMessages((prev) => [...ordered, ...prev])
      setHasNext(res.hasNext)
      setNextCursorId(res.nextCursorId)
    } catch {
      // silently fail
    }
  }, [todoId, token, hasNext, nextCursorId])

  return { messages, isConnected, isLoadingHistory, hasNext, sendMessage, loadMore }
}
