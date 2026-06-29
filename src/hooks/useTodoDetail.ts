import { useEffect, useState } from 'react'
import { ApiError } from '@/lib/apiClient'
import { getTodoDetail, postReaction } from '@/services/todoService'
import { getUnreadChatCount } from '@/services/chatService'
import type { MyTodoStatus, ReactionType, TodoDetail } from '@/types/todo.types'

export function useTodoDetail(
  todoId: number,
  token: string | null,
  myStatusParam: MyTodoStatus | null
) {
  const [todo, setTodo] = useState<TodoDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [chatUnreadCount, setChatUnreadCount] = useState(0)

  useEffect(() => {
    if (!token || !todoId) return
    getTodoDetail(todoId, token)
      .then((res) => setTodo(res))
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : '투두를 불러오지 못했습니다.')
      )
      .finally(() => setIsLoading(false))
    getUnreadChatCount(todoId, token)
      .then(setChatUnreadCount)
      .catch(() => {})
  }, [token, todoId])

  async function handleReact(participantId: number, type: ReactionType) {
    if (!token) return
    try {
      await postReaction(participantId, type, token)
      getTodoDetail(todoId, token)
        .then((res) => setTodo(res))
        .catch(() => null)
    } catch {
      // silently fail
    }
  }

  const effectiveMyStatus: MyTodoStatus | null = todo?.myStatus ?? myStatusParam

  return { todo, isLoading, error, chatUnreadCount, effectiveMyStatus, handleReact }
}
