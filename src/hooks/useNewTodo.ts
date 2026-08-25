import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAsyncTask } from '@/hooks/useAsyncTask'
import { parseDateString, todayString } from '@/lib/dateUtils'
import { getTeamById } from '@/services/teamService'
import { createTodo } from '@/services/todoService'
import type { TeamMember } from '@/types/team.types'
import type { CreateTodoTaskRequest } from '@/types/todo.types'

/** 목록 화면에서 고른 날짜로 새 할 일을 시작할 때 붙는 기본 마감 시각 */
const DEFAULT_DEADLINE_HOUR = 21

/** 목록에서 넘어온 'YYYY-MM-DD'를 그날 저녁 9시 마감으로 바꾼다. 과거 날짜면 무시한다 */
function initialDeadlineFrom(dateParam: string | null): Date | null {
  if (!dateParam) return null
  if (dateParam < todayString()) return null
  const date = parseDateString(dateParam)
  date.setHours(DEFAULT_DEADLINE_HOUR, 0, 0, 0)
  return date
}

export interface MemberDraft {
  excluded: boolean
  expanded: boolean
  customTitle: string
  useCustomDeadline: boolean
  customDeadline: Date | null
}

function createMemberDraft(): MemberDraft {
  return {
    excluded: false,
    expanded: false,
    customTitle: '',
    useCustomDeadline: false,
    customDeadline: null,
  }
}

export function useNewTodo(
  teamId: number,
  token: string | null,
  initialDate: string | null = null
) {
  const router = useRouter()

  const [members, setMembers] = useState<TeamMember[]>([])
  const [isMembersLoading, setIsMembersLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [commonDeadline, setCommonDeadline] = useState<Date | null>(() =>
    initialDeadlineFrom(initialDate)
  )
  const [memberDrafts, setMemberDrafts] = useState<Record<number, MemberDraft>>({})
  const { isLoading, setError, run } = useAsyncTask()

  useEffect(() => {
    if (!token || !teamId) return
    getTeamById(teamId, token)
      .then((team) => {
        setMembers(team.members)
        setMemberDrafts((prev) => {
          const next = { ...prev }
          for (const member of team.members) {
            if (!next[member.userId]) next[member.userId] = createMemberDraft()
          }
          return next
        })
      })
      .catch(() => setError('팀원 목록을 불러오지 못했습니다.'))
      .finally(() => setIsMembersLoading(false))
  }, [token, teamId, setError])

  function updateMemberDraft(userId: number, updates: Partial<MemberDraft>) {
    setMemberDrafts((prev) => ({
      ...prev,
      [userId]: { ...(prev[userId] ?? createMemberDraft()), ...updates },
    }))
  }

  function toggleExclude(userId: number) {
    const draft = memberDrafts[userId]
    updateMemberDraft(userId, {
      excluded: !draft?.excluded,
      expanded: draft?.excluded ? draft.expanded : false,
    })
  }

  function toggleExpand(userId: number) {
    const draft = memberDrafts[userId]
    updateMemberDraft(userId, { expanded: !draft?.expanded })
  }

  function setMemberTitle(userId: number, value: string) {
    updateMemberDraft(userId, { customTitle: value })
  }

  function setMemberDeadlineMode(userId: number, useCustom: boolean) {
    updateMemberDraft(userId, { useCustomDeadline: useCustom })
  }

  function setMemberCustomDeadline(userId: number, date: Date) {
    updateMemberDraft(userId, { customDeadline: date, useCustomDeadline: true })
  }

  async function handleSubmit() {
    if (!title.trim()) return setError('할 일을 입력해주세요.')
    if (!commonDeadline) return setError('공통 마감을 입력해주세요.')
    if (!token) return setError('로그인이 필요합니다.')

    const includedMembers = members.filter((member) => !memberDrafts[member.userId]?.excluded)
    if (includedMembers.length === 0) return setError('최소 한 명의 팀원을 포함해야 합니다.')

    const anyExpanded = includedMembers.some((member) => memberDrafts[member.userId]?.expanded)

    if (!anyExpanded) {
      const created = await run(
        () =>
          createTodo(
            teamId,
            {
              title: title.trim(),
              deadline: commonDeadline.toISOString(),
              description: description.trim() || undefined,
              assigneeIds: includedMembers.map((member) => member.userId),
            },
            token
          ),
        { fallback: '할 일 생성 중 오류가 발생했습니다.' }
      )
      if (!created) return
    } else {
      const tasks: CreateTodoTaskRequest[] = includedMembers.map((member) => {
        const draft = memberDrafts[member.userId]
        const taskTitle =
          draft?.expanded && draft.customTitle.trim() ? draft.customTitle.trim() : title.trim()
        const taskDeadline =
          draft?.expanded && draft.useCustomDeadline && draft.customDeadline
            ? draft.customDeadline
            : commonDeadline
        return {
          title: taskTitle,
          assigneeId: member.userId,
          deadline: taskDeadline.toISOString(),
        }
      })

      const exceedsCommonDeadline = tasks.some(
        (task) => new Date(task.deadline).getTime() > commonDeadline.getTime()
      )
      if (exceedsCommonDeadline) return setError('각자 마감은 공통 마감보다 늦을 수 없습니다.')

      const created = await run(
        () =>
          createTodo(
            teamId,
            {
              title: title.trim(),
              deadline: commonDeadline.toISOString(),
              description: description.trim() || undefined,
              tasks,
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
    title,
    setTitle,
    description,
    setDescription,
    commonDeadline,
    setCommonDeadline,
    memberDrafts,
    toggleExclude,
    toggleExpand,
    setMemberTitle,
    setMemberDeadlineMode,
    setMemberCustomDeadline,
    isLoading,
    handleSubmit,
  }
}
