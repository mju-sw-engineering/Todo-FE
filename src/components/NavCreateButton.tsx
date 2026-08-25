'use client'

import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import toast from 'react-hot-toast'
import { BlobAvatar } from '@/components/ui/BlobAvatar'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { getTeams } from '@/services/teamService'
import { useAuth } from '@/store/authStore'
import type { TeamListItem } from '@/types/team.types'

/** 탭바에서 생성 버튼이 차지하는 폭(px). w-17과 같은 값 */
const NAV_SLOT_WIDTH = 68

/** 지금 보고 있는 화면이 특정 팀 안이면 그 팀 id를 돌려준다 */
function currentTeamId(pathname: string): number | null {
  const matched = pathname.match(/^\/teams\/(\d+)/)
  return matched ? Number(matched[1]) : null
}

/**
 * 탭바 가운데에 얹히는 앱 전역 "할 일 추가" 버튼.
 *
 * 떠 있는 FAB과 달리 탭바가 원래 차지하던 자리에 들어가므로 어떤 화면에서도
 * 콘텐츠를 가리지 않는다. 팀 화면에서 누르면 그 팀으로 바로 가고, 그 밖에서는
 * 어느 팀에 만들지 물어본다.
 */
export function NavCreateButton() {
  const router = useRouter()
  const pathname = usePathname()
  const { token } = useAuth()
  const reduceMotion = useReducedMotion()

  const [teams, setTeams] = useState<TeamListItem[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  // 이미 만들기 화면이면 눌러봐야 같은 경로가 히스토리에 쌓일 뿐이라 자리째 접는다
  const onCreatePage = pathname.endsWith('/todos/new')

  async function handleClick() {
    const teamId = currentTeamId(pathname)
    if (teamId !== null) {
      router.push(`/teams/${teamId}/todos/new`)
      return
    }
    if (!token || isPending) return

    // 팀 목록은 실제로 물어봐야 할 때만 가져온다
    setIsPending(true)
    try {
      const { teams: fetched } = await getTeams(token)
      setTeams(fetched)
      setPickerOpen(true)
    } catch {
      // 조용히 실패하면 버튼이 고장 난 것처럼 보인다
      toast.error('팀 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      {/* 폭까지 같이 줄여야 남은 탭 4개가 빈자리를 메우며 자연스럽게 퍼진다 */}
      <motion.div
        initial={false}
        animate={{ width: onCreatePage ? 0 : NAV_SLOT_WIDTH }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
        className={`shrink-0 flex items-center justify-center overflow-hidden ${
          onCreatePage ? 'pointer-events-none' : ''
        }`}
      >
        <motion.button
          type="button"
          onClick={handleClick}
          disabled={isPending}
          aria-hidden={onCreatePage}
          tabIndex={onCreatePage ? -1 : 0}
          aria-label="할 일 추가"
          initial={false}
          animate={{ scale: onCreatePage ? 0.4 : 1, opacity: onCreatePage ? 0 : 1 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
          className="w-12 h-12 shrink-0 rounded-full bg-primary text-white flex items-center justify-center shadow-[0_4px_14px_rgba(102,153,255,0.45)] hover:bg-primary-hover active:scale-90 disabled:opacity-60"
        >
          <svg
            className="w-5.5 h-5.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
        </motion.button>
      </motion.div>

      {pickerOpen && (
        <BottomSheet onClose={() => setPickerOpen(false)}>
          <h2 className="text-[17px] font-bold text-ink">어느 팀에 추가할까요?</h2>
          <p className="mt-1 text-[12px] text-muted">
            {teams.length === 0
              ? '할 일은 팀 안에서 만들어요. 먼저 팀에 들어가주세요.'
              : '할 일을 만들 팀을 선택해주세요.'}
          </p>
          <div className="my-5 max-h-72 flex flex-col gap-2 overflow-y-auto">
            {teams.length === 0 && (
              <Button variant="outline" onClick={() => router.push('/teams')}>
                팀 만들거나 참여하기
              </Button>
            )}
            {teams.map((team) => (
              <button
                key={team.teamId}
                onClick={() => router.push(`/teams/${team.teamId}/todos/new`)}
                className="w-full flex items-center gap-3 rounded-[14px] border border-border px-4 py-3 text-left hover:border-neutral-50 transition-colors"
              >
                {team.teamImageUrl ? (
                  <span className="w-8 h-8 rounded-full overflow-hidden shrink-0 relative">
                    <Image
                      src={team.teamImageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </span>
                ) : (
                  <BlobAvatar seed={team.teamName} size={32} />
                )}
                <span className="text-[14px] font-semibold text-ink">{team.teamName}</span>
              </button>
            ))}
          </div>
        </BottomSheet>
      )}
    </>
  )
}
