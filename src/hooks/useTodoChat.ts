'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getTodoChatMessages, markChatRead } from '@/services/chatService'
import { useAuth } from '@/store/authStore'
import type { TodoChatMessage } from '@/types/chat.types'

function getSockJsUrl(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'
  return apiBase + '/ws'
}

let tempId = -1
function nextTempId() {
  return tempId--
}

const chatKey = (todoId: number) => ['todo-chat', todoId] as const

interface TypingPayload {
  isTyping?: boolean
  typing?: boolean
  senderNickname?: string
  nickname?: string
  memberNickname?: string
  senderId?: number
  userId?: number
  memberId?: number
}

export function useTodoChat(todoId: number, token: string | null) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const clientRef = useRef<Client | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [hasNext, setHasNext] = useState(false)
  const [nextCursorId, setNextCursorId] = useState<number | null>(null)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const typingTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const isTypingRef = useRef(false)
  const stopTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Initial history via TanStack Query
  const { isLoading: isLoadingHistory } = useQuery({
    queryKey: chatKey(todoId),
    queryFn: async () => {
      const res = await getTodoChatMessages(todoId, token!)
      setHasNext(res.hasNext)
      setNextCursorId(res.nextCursorId ?? null)
      return res.messages.slice().reverse() as TodoChatMessage[]
    },
    enabled: !!token,
    initialData: undefined,
  })

  const messages: TodoChatMessage[] =
    queryClient.getQueryData<TodoChatMessage[]>(chatKey(todoId)) ?? []

  // Mark chat as read when messages update
  useEffect(() => {
    if (!token || messages.length === 0) return
    const lastRealMessage = [...messages].reverse().find((m) => m.messageId > 0)
    if (!lastRealMessage) return
    markChatRead(todoId, lastRealMessage.messageId, token).catch(() => {})
  }, [todoId, token, messages])

  // WebSocket connection
  useEffect(() => {
    if (!token) return

    const client = new Client({
      webSocketFactory: () => new SockJS(getSockJsUrl()),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      onConnect: () => {
        setIsConnected(true)

        client.subscribe(`/topic/todos/${todoId}`, () => {
          queryClient.invalidateQueries({ queryKey: chatKey(todoId) })
        })

        client.subscribe(`/topic/todos/${todoId}/typing`, (frame) => {
          try {
            const data = JSON.parse(frame.body) as TypingPayload
            console.log('[typing received]', data)

            const isTyping = data.isTyping ?? data.typing ?? false
            const nickname = data.senderNickname ?? data.nickname ?? data.memberNickname ?? ''
            const senderId = data.senderId ?? data.userId ?? data.memberId

            // Skip own typing events
            if (senderId != null && senderId === user?.userId) return
            if (nickname && nickname === (user?.nickname ?? user?.loginId)) return

            const key = nickname || String(senderId ?? 'unknown')

            if (isTyping) {
              if (typingTimersRef.current[key]) {
                clearTimeout(typingTimersRef.current[key])
              }
              setTypingUsers((prev) => (prev.includes(key) ? prev : [...prev, key]))
              typingTimersRef.current[key] = setTimeout(() => {
                setTypingUsers((prev) => prev.filter((n) => n !== key))
                delete typingTimersRef.current[key]
              }, 4000)
            } else {
              clearTimeout(typingTimersRef.current[key])
              delete typingTimersRef.current[key]
              setTypingUsers((prev) => prev.filter((n) => n !== key))
            }
          } catch {
            // silently ignore malformed frames
          }
        })
      },
      onDisconnect: () => setIsConnected(false),
      onStompError: () => setIsConnected(false),
    })

    client.activate()
    clientRef.current = client

    return () => {
      // Send stop-typing on unmount
      if (client.connected && isTypingRef.current) {
        client.publish({
          destination: `/app/todos/${todoId}/typing`,
          body: JSON.stringify({ isTyping: false }),
        })
      }
      client.deactivate()
      setIsConnected(false)
      // Clear all typing timers
      Object.values(typingTimersRef.current).forEach(clearTimeout)
    }
  }, [todoId, token, queryClient, user])

  // Send with optimistic update
  const { mutate: sendMessage } = useMutation({
    mutationFn: async (content: string) => {
      const client = clientRef.current
      if (!client?.connected) throw new Error('not connected')
      client.publish({
        destination: `/app/todos/${todoId}/chat`,
        body: JSON.stringify({ content }),
      })
    },
    onMutate: async (content) => {
      // Stop typing when message is sent
      if (stopTypingTimerRef.current) clearTimeout(stopTypingTimerRef.current)
      if (isTypingRef.current && clientRef.current?.connected) {
        clientRef.current.publish({
          destination: `/app/todos/${todoId}/typing`,
          body: JSON.stringify({ isTyping: false }),
        })
        isTypingRef.current = false
      }

      await queryClient.cancelQueries({ queryKey: chatKey(todoId) })
      const previous = queryClient.getQueryData<TodoChatMessage[]>(chatKey(todoId))

      const optimistic: TodoChatMessage = {
        messageId: nextTempId(),
        senderId: user?.userId ?? 0,
        senderNickname: user?.nickname ?? user?.loginId ?? '',
        senderProfileImageUrl: user?.profileImageUrl ?? null,
        content,
        createdAt: new Date().toISOString(),
      }

      queryClient.setQueryData<TodoChatMessage[]>(chatKey(todoId), (old) => [
        ...(old ?? []),
        optimistic,
      ])

      return { previous }
    },
    onError: (_err, _content, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(chatKey(todoId), context.previous)
      }
    },
  })

  const loadMore = useCallback(async () => {
    if (!token || !hasNext || nextCursorId == null) return
    try {
      const res = await getTodoChatMessages(todoId, token, nextCursorId)
      const older = res.messages.slice().reverse()
      queryClient.setQueryData<TodoChatMessage[]>(chatKey(todoId), (old) => [
        ...older,
        ...(old ?? []),
      ])
      setHasNext(res.hasNext)
      setNextCursorId(res.nextCursorId ?? null)
    } catch {
      // silently fail
    }
  }, [todoId, token, hasNext, nextCursorId, queryClient])

  // Notify typing — call on every input change
  const notifyTyping = useCallback(() => {
    const client = clientRef.current
    if (!client?.connected) return

    if (!isTypingRef.current) {
      isTypingRef.current = true
      client.publish({
        destination: `/app/todos/${todoId}/typing`,
        body: JSON.stringify({ isTyping: true }),
      })
    }

    // Debounce stop-typing
    if (stopTypingTimerRef.current) clearTimeout(stopTypingTimerRef.current)
    stopTypingTimerRef.current = setTimeout(() => {
      if (client.connected) {
        client.publish({
          destination: `/app/todos/${todoId}/typing`,
          body: JSON.stringify({ isTyping: false }),
        })
      }
      isTypingRef.current = false
    }, 2000)
  }, [todoId])

  return {
    messages,
    isConnected,
    isLoadingHistory,
    hasNext,
    typingUsers,
    sendMessage: (content: string) => sendMessage(content),
    loadMore,
    notifyTyping,
  }
}
