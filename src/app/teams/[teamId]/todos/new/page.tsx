'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AVATAR_COLORS, getInitials } from '@/lib/formatters'
import { ApiError } from '@/lib/apiClient'
import { getTeamById } from '@/services/teamService'
import { createTodo } from '@/services/todoService'
import { useAuth } from '@/store/authStore'
import type { TeamMember } from '@/types/team.types'

function toIsoDeadline(timeValue: string): string {
  const [hours, minutes] = timeValue.split(':').map(Number)
  const d = new Date()
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

export default function TodoNewPage() {
  const router = useRouter()
  const params = useParams()
  const teamId = Number(params.teamId)
  const { token } = useAuth()

  const [members, setMembers] = useState<TeamMember[]>([])
  const [isMembersLoading, setIsMembersLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const [description, setDescription] = useState('')
  const [excludedIds, setExcludedIds] = useState<Set<number>>(new Set())
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!token || !teamId) return
    getTeamById(teamId, token)
      .then((team) => setMembers(team.members))
      .catch(() => setError('팀원 목록을 불러오지 못했습니다.'))
      .finally(() => setIsMembersLoading(false))
  }, [token, teamId])

  function toggleExclude(userId: number) {
    setExcludedIds((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })
  }

  async function handleSubmit() {
    setError('')
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

    setIsLoading(true)
    try {
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
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '할 일 생성 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-white animate-fade-up">
      {/* 헤더 (스크롤 고정) */}
      <div className="px-6 pt-8 pb-2">
        <button
          onClick={() => router.back()}
          className="text-[13px] font-semibold text-muted mb-6 flex items-center gap-1 hover:text-primary transition-colors"
        >
          ← 뒤로
        </button>
        <h1 className="text-[22px] font-bold text-ink">할 일 만들기</h1>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-[13px] font-semibold text-primary tracking-wide">
            제목
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (error) setError('')
            }}
            placeholder="할 일 제목을 입력해주세요"
            className="w-full px-4 py-3.25 rounded-[14px] border-[1.5px] border-border bg-white text-[14px] text-ink placeholder:text-muted placeholder:font-light outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_4px_rgba(91,79,207,0.10)]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="deadline"
            className="text-[13px] font-semibold text-primary tracking-wide"
          >
            마감 시간
          </label>
          <input
            id="deadline"
            type="time"
            value={deadline}
            onChange={(e) => {
              setDeadline(e.target.value)
              if (error) setError('')
            }}
            className="w-full px-4 py-3.25 rounded-[14px] border-[1.5px] border-border bg-white text-[14px] text-ink outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_4px_rgba(91,79,207,0.10)]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="description"
            className="text-[13px] font-semibold text-primary tracking-wide"
          >
            설명
            <span className="ml-1 text-[12px] font-normal text-muted">(선택)</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="할 일에 대한 설명을 입력해주세요"
            rows={3}
            className="w-full px-4 py-3.25 rounded-[14px] border-[1.5px] border-border bg-white text-[14px] text-ink placeholder:text-muted placeholder:font-light outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_4px_rgba(91,79,207,0.10)] resize-none"
          />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[13px] font-semibold text-primary tracking-wide">팀원</p>
          {isMembersLoading ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {members.map((member, idx) => {
                const isExcluded = excludedIds.has(member.userId)
                const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length]
                return (
                  <li
                    key={member.userId}
                    className={`flex items-center justify-between bg-white rounded-[14px] border border-border px-4 py-3.5 transition-all duration-200 ${
                      isExcluded ? 'opacity-40' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${avatarColor}`}
                      >
                        {getInitials(member.nickname)}
                      </div>
                      <span className="text-[14px] font-medium text-ink">{member.nickname}</span>
                    </div>
                    {isExcluded ? (
                      <button
                        onClick={() => toggleExclude(member.userId)}
                        className="text-[13px] font-semibold text-muted"
                      >
                        제외됨
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleExclude(member.userId)}
                        className="px-4 py-1.5 rounded-[10px] border border-border text-[13px] font-semibold text-ink transition-all duration-200 hover:border-primary hover:text-primary"
                      >
                        제외
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {error && (
          <p className="text-[13px] text-red-400 bg-red-50 rounded-[10px] px-4 py-2.5">{error}</p>
        )}
      </div>

      {/* 바텀 버튼 (항상 고정) */}
      <div className="px-6 py-5 border-t border-border flex flex-col gap-3">
        <button
          onClick={handleSubmit}
          disabled={isLoading || isMembersLoading}
          className="w-full py-3.75 bg-primary text-white text-[15px] font-semibold rounded-[14px] shadow-[0_4px_18px_rgba(91,79,207,0.22)] transition-all duration-200 hover:bg-primary-hover hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {isLoading ? '생성 중...' : '생성하기'}
        </button>
        <button
          onClick={() => router.back()}
          className="w-full py-3.75 bg-primary-light text-primary text-[15px] font-semibold rounded-[14px] transition-all duration-200 hover:bg-[#e0daf8]"
        >
          돌아가기
        </button>
      </div>
    </div>
  )
}
