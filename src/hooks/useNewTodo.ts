import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { getTeamById } from '@/services/teamService'
import { createTodo } from '@/services/todoService'
import type { TeamMember } from '@/types/team.types'

function toIsoDeadline(timeValue: string): string {
  const [hours, minutes] = timeValue.split(':').map(Number)
  const d = new Date()
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

export function useNewTodo(teamId: number, token: string | null) {
  const router = useRouter()

  const [members, setMembers] = useState<TeamMember[]>([])
  const [isMembersLoading, setIsMembersLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const [description, setDescription] = useState('')
  const [excludedIds, setExcludedIds] = useState<Set<number>>(new Set())
  const { isLoading, error, setError, run } = useAsyncTask()

  useEffect(() => {
    if (!token || !teamId) return
    getTeamById(teamId, token)
      .then((team) => setMembers(team.members))
      .catch(() => setError('팀원 목록을 불러오지 못했습니다.'))
      .finally(() => setIsMembersLoading(false))
  }, [token, teamId, setError])

  function toggleExclude(userId: number) {
    setExcludedIds((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  async function handleSubmit() {
    if (!title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }
    if (!deadline) {
      setError('마감 시간을 입력해주세요.')
      return
    }
    if (!token) {
      setError('로그인이 필요합니다.')
      return
    }

    const assigneeIds = members.filter((m) => !excludedIds.has(m.userId)).map((m) => m.userId)
    if (assigneeIds.length === 0) {
      setError('최소 한 명의 팀원을 포함해야 합니다.')
      return
    }

    await run(
      async () => {
        await createTodo(
          teamId,
          {
            title: title.trim(),
            deadline: toIsoDeadline(deadline),
            description: description.trim() || undefined,
            assigneeIds,
          },
          token
        )
        router.push(`/teams/${teamId}/todos?created=1`)
      },
      { fallback: '할 일 생성 중 오류가 발생했습니다.' }
    )
  }

  return {
    members,
    isMembersLoading,
    title,
    setTitle,
    deadline,
    setDeadline,
    description,
    setDescription,
    excludedIds,
    toggleExclude,
    error,
    setError,
    isLoading,
    handleSubmit,
  }
}
