import { BlobAvatar } from '@/components/ui/BlobAvatar'
import type { FeedVerification } from '@/types/feed.types'

const TEAM_TAG_VARIANTS = [
  { bg: '#DCF5DC', ink: '#0F3D0F' },
  { bg: '#FCE0EA', ink: '#4D0F26' },
  { bg: '#DCEAFA', ink: '#0F2A4D' },
  { bg: '#FCEFC2', ink: '#4D3A0F' },
]

const PHOTO_GRADIENTS = [
  'linear-gradient(135deg, #FFF0C2 0%, #FFD8CC 100%)',
  'linear-gradient(135deg, #D8ECFF 0%, #DCF5E4 100%)',
]

interface VerificationFeedCardProps {
  verification: FeedVerification
  index: number
}

export function VerificationFeedCard({ verification, index }: VerificationFeedCardProps) {
  const tag = TEAM_TAG_VARIANTS[verification.teamId % TEAM_TAG_VARIANTS.length]
  const gradient = PHOTO_GRADIENTS[index % PHOTO_GRADIENTS.length]

  return (
    <div className="bg-white rounded-[18px] border border-border overflow-hidden">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5">
        <BlobAvatar seed={verification.userNickname} size={32} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[13px] font-bold text-ink truncate min-w-0">
              {verification.userNickname}
            </span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
              style={{ background: tag.bg, color: tag.ink }}
            >
              {verification.teamName}
            </span>
          </div>
          <p className="text-[11px] text-muted mt-0.5">{verification.verifiedAt}</p>
        </div>
      </div>

      <div className="relative h-36 flex items-end p-3" style={{ background: gradient }}>
        <span className="absolute top-3 left-3.5 text-[26px] leading-none opacity-90">
          {verification.emoji}
        </span>
        <span className="bg-black/55 text-white text-[12px] font-semibold px-2.5 py-1.5 rounded-full">
          {verification.todoTitle}
        </span>
      </div>

      <div className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] font-semibold text-muted">
        <span>❤️ {verification.likeCount}</span>
        <span>🔥 {verification.streakDays}일째 연속 인증</span>
      </div>
    </div>
  )
}
