'use client'

import { useRouter } from 'next/navigation'
import { IoFlame } from 'react-icons/io5'
import { HiveIcon } from '@/components/ui/HiveIcon'
import type { TeamRhythm } from '@/types/feed.types'
import { withRanks } from './rank'

/** 1~3위 배지 배경(금/은/동), 4위 이하는 그냥 회색 숫자 */
const RANK_BG = ['#ffe042', '#d3d3d3', '#e0a45a']
const RANK_TEXT = ['#5a3d00', '#333333', '#ffffff']

interface Props {
  teams: TeamRhythm[]
}

/** 팀 리듬 미리보기 — 상위 팀 순위만 보여주고, 탭하면 /feed/team-rhythm 상세로 이동한다 */
export function TeamRhythmPreviewCard({ teams }: Props) {
  const router = useRouter()
  if (teams.length === 0) return null

  const ranked = withRanks(teams).slice(0, 3)

  return (
    <section className="mx-5 mt-4">
      <button
        type="button"
        onClick={() => router.push('/feed/team-rhythm')}
        className="w-full text-left bg-white rounded-[22px] border border-border p-5 active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-black text-ink flex items-center gap-1.5">
            <HiveIcon size={16} />팀 리듬
          </h2>
          <span className="flex items-center gap-0.5 text-[11.5px] font-bold text-muted">
            자세히 보기
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
            </svg>
          </span>
        </div>

        <div className="flex flex-col gap-2 mt-3">
          {ranked.map(({ team, rank, tied }) => (
            <div key={team.teamId} className="flex items-center gap-2.5">
              {rank <= 3 ? (
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
                  style={{ background: RANK_BG[rank - 1], color: RANK_TEXT[rank - 1] }}
                >
                  {rank}
                </span>
              ) : (
                <span className="w-6 text-center text-[11px] font-bold text-muted shrink-0">
                  {rank}
                </span>
              )}
              <span className="flex-1 min-w-0 text-[13px] font-bold text-ink truncate">
                {team.teamName}
                {tied && <span className="ml-1 text-[10px] font-semibold text-muted">공동</span>}
              </span>
              <span className="flex items-center gap-0.5 text-[11px] font-semibold text-muted shrink-0">
                <IoFlame size={12} className="text-secondary-50" />
                {team.streakDays}일 연속
              </span>
            </div>
          ))}
        </div>
      </button>
    </section>
  )
}
