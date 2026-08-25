'use client'

import { useRouter } from 'next/navigation'
import { FiClock, FiMessageCircle, FiSettings, FiX } from 'react-icons/fi'
import type { IconType } from 'react-icons'
import { SideSheet } from '@/components/ui/SideSheet'

type MenuTone = 'primary' | 'secondary' | 'neutral'

const TONE_CLASSES: Record<MenuTone, string> = {
  primary: 'bg-primary/12 text-primary',
  secondary: 'bg-secondary-50/15 text-secondary-50',
  neutral: 'bg-neutral-30 text-neutral-80',
}

interface TeamMenuSheetProps {
  teamId: number
  onClose: () => void
}

/**
 * 팀에 딸린 화면들로 가는 메뉴. 오른쪽에서 밀려 들어오는 사이드 시트로 연다.
 * 제목을 두지 않는다 — 시트 옆으로 헤더에 팀 이름이 그대로 보이고,
 * 무언가를 묻는 시트가 아니라 갈 곳을 늘어놓는 시트라서다.
 */
export function TeamMenuSheet({ teamId, onClose }: TeamMenuSheetProps) {
  const router = useRouter()

  const items: {
    label: string
    description: string
    href: string
    Icon: IconType
    tone: MenuTone
  }[] = [
    {
      label: '시간 투표',
      description: '팀원들과 가능한 시간을 맞춰봐요',
      href: `/teams/${teamId}/availability`,
      Icon: FiClock,
      tone: 'primary',
    },
    {
      label: '팀 채팅',
      description: '팀원들과 이야기 나눠요',
      href: `/teams/${teamId}/chat`,
      Icon: FiMessageCircle,
      tone: 'secondary',
    },
    {
      label: '팀 설정',
      description: '팀원 초대, 피드 공개 범위',
      href: `/teams/${teamId}/settings`,
      Icon: FiSettings,
      tone: 'neutral',
    },
  ]

  return (
    <SideSheet onClose={onClose}>
      <button
        type="button"
        onClick={onClose}
        aria-label="메뉴 닫기"
        className="mb-4 flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-neutral-30"
      >
        <FiX size={18} />
      </button>

      <div className="flex flex-col gap-2">
        {items.map(({ label, description, href, Icon, tone }) => (
          <button
            key={href}
            onClick={() => router.push(href)}
            className="flex w-full items-center gap-3 rounded-[14px] border border-border px-3.5 py-3 text-left transition-all hover:border-neutral-50 active:scale-[0.99]"
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${TONE_CLASSES[tone]}`}
            >
              <Icon size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-bold text-ink">{label}</span>
              <span className="mt-0.5 block text-[11.5px] text-muted">{description}</span>
            </span>
          </button>
        ))}
      </div>
    </SideSheet>
  )
}
