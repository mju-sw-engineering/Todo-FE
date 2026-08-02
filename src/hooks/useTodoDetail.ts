import { useCallback, useEffect, useState } from 'react'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { getTodoDetail, postReaction, reassignTodoWorkItem } from '@/services/todoService'
import type { ReactionType, TodoDetail } from '@/types/todo.types'

export function useTodoDetail(todoId: number, token: string | null) {
  const [todo, setTodo] = useState<TodoDetail | null>(null)
  const { isLoading, error, run } = useAsyncTask(true)

  const refreshTodo = useCallback(async () => {
    if (!token || !todoId) return
    const response = await getTodoDetail(todoId, token)
    setTodo(response)
  }, [token, todoId])

  useEffect(() => {
    if (!token || !todoId) return
    run(refreshTodo, { fallback: '투두를 불러오지 못했습니다.' })
  }, [token, todoId, refreshTodo, run])

  async function handleReact(workItemId: number, type: ReactionType) {
    if (!token) return
    try {
      await postReaction(workItemId, type, token)
      await refreshTodo()
    } catch {
      // 반응 실패는 상세 화면 전체를 막지 않는다.
    }
  }

  async function handleReassign(workItemId: number, assigneeId: number) {
    if (!token) return
    await reassignTodoWorkItem(workItemId, assigneeId, token)
    await refreshTodo()
  }

  return { todo, isLoading, error, refreshTodo, handleReact, handleReassign }
}
