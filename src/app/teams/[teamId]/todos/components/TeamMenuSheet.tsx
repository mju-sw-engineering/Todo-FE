'use client'

import { useRouter } from 'next/navigation'
import { BottomSheet } from '@/components/ui/BottomSheet'

interface TeamMenuSheetProps {
  teamId: number
  onClose: () => void
}

/**
 * 팀에 딸린 화면들로 가는 메뉴.
 * 제목을 두지 않는다 — 시트 뒤 헤더에 팀 이름이 그대로 보이고,
 * 무언가를 묻는 시트가 아니라 갈 곳을 늘어놓는 시트라서다.
 */
export function TeamMenuSheet({ teamId, onClose }: TeamMenuSheetProps) {
  const router = useRouter()

  const items = [
    {
      label: '시간 투표',
      description: '팀원들과 가능한 시간을 맞춰봐요',
      href: `/teams/${teamId}/availability`,
    },
    {
      label: '팀 채팅',
      description: '팀원들과 이야기 나눠요',
      href: `/teams/${teamId}/chat`,
    },
    {
      label: '팀 설정',
      description: '팀원 초대, 피드 공개 범위',
      href: `/teams/${teamId}/settings`,
    },
  ]

  return (
    <BottomSheet onClose={onClose}>
      <div className="mb-1 flex flex-col gap-2">
        {items.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className="w-full rounded-[14px] border border-border px-4 py-3.5 text-left hover:border-neutral-50 active:scale-[0.99] transition-all"
          >
            <span className="block text-[14px] font-bold text-ink">{item.label}</span>
            <span className="block text-[11.5px] text-muted mt-0.5">{item.description}</span>
          </button>
        ))}
      </div>
    </BottomSheet>
  )
}
