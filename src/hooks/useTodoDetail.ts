import { useEffect, useState } from 'react'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { getTodoDetail, postReaction } from '@/services/todoService'
import { getUnreadChatCount } from '@/services/chatService'
import type { MyTodoStatus, ReactionType, TodoDetail } from '@/types/todo.types'

export function useTodoDetail(
  todoId: number,
  token: string | null,
  myStatusParam: MyTodoStatus | null
) {
  const [todo, setTodo] = useState<TodoDetail | null>(null)
  const { isLoading, error, run } = useAsyncTask(true)
  const [chatUnreadCount, setChatUnreadCount] = useState(0)

  useEffect(() => {
    if (!token || !todoId) return
    run(
      async () => {
        const res = await getTodoDetail(todoId, token)
        setTodo(res)
      },
      { fallback: '투두를 불러오지 못했습니다.' }
    )
    getUnreadChatCount(todoId, token)
      .then(setChatUnreadCount)
      .catch(() => {})
  }, [token, todoId, run])

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
