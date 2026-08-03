import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { getTeamById } from '@/services/teamService'
import { createTodo } from '@/services/todoService'
import type { TeamMember } from '@/types/team.types'
import type { TodoMode } from '@/types/todo.types'

function toIsoDeadline(timeValue: string): string {
  const [hours, minutes] = timeValue.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

let nextDraftId = 1

export interface TodoTaskDraft {
  draftId: number
  title: string
  description: string
  assigneeId: number | null
  deadline: string
}

function createTaskDraft(): TodoTaskDraft {
  return {
    draftId: nextDraftId++,
    title: '',
    description: '',
    assigneeId: null,
    deadline: '',
  }
}

export function useNewTodo(teamId: number, token: string | null) {
  const router = useRouter()

  const [members, setMembers] = useState<TeamMember[]>([])
  const [isMembersLoading, setIsMembersLoading] = useState(true)
  const [mode, setMode] = useState<TodoMode>('DIRECT')
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const [description, setDescription] = useState('')
  const [excludedIds, setExcludedIds] = useState<Set<number>>(new Set())
  const [tasks, setTasks] = useState<TodoTaskDraft[]>(() => [createTaskDraft()])
  const { isLoading, error, setError, run } = useAsyncTask()

  useEffect(() => {
    if (!token || !teamId) return
    getTeamById(teamId, token)
      .then((team) => setMembers(team.members))
      .catch(() => setError('팀원 목록을 불러오지 못했습니다.'))
      .finally(() => setIsMembersLoading(false))
  }, [token, teamId, setError])

  function changeMode(nextMode: TodoMode) {
    setMode(nextMode)
    setError(null)
  }

  function toggleExclude(userId: number) {
    setExcludedIds((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  function updateTask(draftId: number, updates: Partial<Omit<TodoTaskDraft, 'draftId'>>) {
    setTasks((prev) =>
      prev.map((task) => (task.draftId === draftId ? { ...task, ...updates } : task))
    )
    if (error) setError(null)
  }

  function addTask() {
    setTasks((prev) => [...prev, createTaskDraft()])
  }

  function removeTask(draftId: number) {
    setTasks((prev) => (prev.length === 1 ? prev : prev.filter((task) => task.draftId !== draftId)))
  }

  async function handleSubmit() {
    if (!title.trim()) return setError('제목을 입력해주세요.')
    if (!deadline) return setError('최종 마감 시간을 입력해주세요.')
    if (!token) return setError('로그인이 필요합니다.')

    const todoDeadline = toIsoDeadline(deadline)

    if (mode === 'DIRECT') {
      const assigneeIds = members
        .filter((member) => !excludedIds.has(member.userId))
        .map((member) => member.userId)
      if (assigneeIds.length === 0) return setError('최소 한 명의 팀원을 포함해야 합니다.')

      const created = await run(
        () =>
          createTodo(
            teamId,
            {
              title: title.trim(),
              deadline: todoDeadline,
              description: description.trim() || undefined,
              assigneeIds,
            },
            token
          ),
        { fallback: '할 일 생성 중 오류가 발생했습니다.' }
      )
      if (!created) return
    } else {
      const invalidTask = tasks.find(
        (task) => !task.title.trim() || !task.assigneeId || !task.deadline
      )
      if (invalidTask) return setError('모든 Task의 제목, 담당자, 마감을 입력해주세요.')

      const exceedsTodoDeadline = tasks.some(
        (task) =>
          new Date(toIsoDeadline(task.deadline)).getTime() > new Date(todoDeadline).getTime()
      )
      if (exceedsTodoDeadline) return setError('Task 마감은 최종 마감보다 늦을 수 없습니다.')

      const created = await run(
        () =>
          createTodo(
            teamId,
            {
              title: title.trim(),
              deadline: todoDeadline,
              description: description.trim() || undefined,
              tasks: tasks.map((task) => ({
                title: task.title.trim(),
                description: task.description.trim() || undefined,
                assigneeId: task.assigneeId!,
                deadline: toIsoDeadline(task.deadline),
              })),
            },
            token
          ),
        { fallback: '할 일 생성 중 오류가 발생했습니다.' }
      )
      if (!created) return
    }

    router.push(`/teams/${teamId}/todos?created=1`)
  }

  return {
    members,
    isMembersLoading,
    mode,
    changeMode,
    title,
    setTitle,
    deadline,
    setDeadline,
    description,
    setDescription,
    excludedIds,
    toggleExclude,
    tasks,
    updateTask,
    addTask,
    removeTask,
    error,
    setError,
    isLoading,
    handleSubmit,
  }
}
