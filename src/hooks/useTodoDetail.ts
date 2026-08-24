import { useCallback, useEffect, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { getTodoDetail, postReaction, reassignTodoWorkItem } from '@/services/todoService'
import type { ReactionType, TodoDetail } from '@/types/todo.types'

function getSockJsUrl(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'
  return apiBase + '/ws'
}

interface ProofAnalysisEvent {
  todoId: number
  workItemId: number
  status: string
  verdict: string | null
  summary: string | null
}

export function useTodoDetail(todoId: number, teamId: number, token: string | null) {
  const [todo, setTodo] = useState<TodoDetail | null>(null)
  const { isLoading, error, run } = useAsyncTask(true)

  const refreshTodo = useCallback(
    async (options?: { force?: boolean }) => {
      if (!token || !todoId) return
      const response = await getTodoDetail(todoId, token, options)
      setTodo(response)
    },
    [token, todoId]
  )

  useEffect(() => {
    if (!token || !todoId) return
    run(refreshTodo, { fallback: '할 일을 불러오지 못했습니다.' })
  }, [token, todoId, refreshTodo, run])

  // AI 판정 완료 실시간 반영 — best-effort 트리거일 뿐, 진실은 항상 REST 응답이다.
  // 놓치더라도 카드 재진입 시 refreshTodo로 다시 맞춰지므로 여기서는 재조회만 건다.
  useEffect(() => {
    if (!token || !teamId) return

    const client = new Client({
      webSocketFactory: () => new SockJS(getSockJsUrl()),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/teams/${teamId}/proof-analyses`, (frame) => {
          try {
            const data = JSON.parse(frame.body) as ProofAnalysisEvent
            // 판정은 제출 직후 요청 캐시 TTL 안에 끝나는 일이 잦다. 캐시를 타면
            // 판정 전 응답이 그대로 돌아오므로 이 경로만 강제 재조회한다.
            if (data.todoId === todoId) refreshTodo({ force: true })
          } catch {
            // 잘못된 프레임은 무시
          }
        })
      },
    })

    client.activate()
    return () => {
      client.deactivate()
    }
  }, [teamId, token, todoId, refreshTodo])

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
