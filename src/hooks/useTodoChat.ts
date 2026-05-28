'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getTodoChatMessages } from '@/services/chatService'
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

export function useTodoChat(todoId: number, token: string | null) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const clientRef = useRef<Client | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [hasNext, setHasNext] = useState(false)
  const [nextCursorId, setNextCursorId] = useState<number | null>(null)

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

  // WebSocket connection
  useEffect(() => {
    if (!token) return

    const client = new Client({
      webSocketFactory: () => new SockJS(getSockJsUrl()),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      onConnect: () => {
        setIsConnected(true)
        client.subscribe(`/topic/todos/${todoId}`, (frame) => {
          try {
            const msg: TodoChatMessage = JSON.parse(frame.body)
            queryClient.setQueryData<TodoChatMessage[]>(chatKey(todoId), (old) => {
              const list = old ?? []
              // Replace matching optimistic placeholder
              const optIdx = list.findIndex((m) => m.chatId < 0 && m.content === msg.content)
              if (optIdx !== -1) {
                const next = [...list]
                next[optIdx] = msg
                return next
              }
              // Deduplicate real messages
              if (list.some((m) => m.chatId === msg.chatId)) return list
              return [...list, msg]
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
      setIsConnected(false)
    }
  }, [todoId, token, queryClient])

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
      await queryClient.cancelQueries({ queryKey: chatKey(todoId) })
      const previous = queryClient.getQueryData<TodoChatMessage[]>(chatKey(todoId))

      const optimistic: TodoChatMessage = {
        chatId: nextTempId(),
        userId: user?.userId ?? 0,
        nickname: user?.nickname ?? '',
        profileImageUrl: user?.profileImageUrl ?? null,
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

  return {
    messages,
    isConnected,
    isLoadingHistory,
    hasNext,
    sendMessage: (content: string) => sendMessage(content),
    loadMore,
  }
}
