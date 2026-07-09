import { BlobAvatar } from '@/components/ui/BlobAvatar'

interface MemberAvatarProps {
  profileImageUrl?: string | null
  nickname: string
  size?: number
  className?: string
}

export function MemberAvatar({
  profileImageUrl,
  nickname,
  size = 40,
  className = '',
}: MemberAvatarProps) {
  if (profileImageUrl) {
    return (
      <div
        className={`relative rounded-full overflow-hidden shrink-0 border border-border ${className}`}
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={profileImageUrl} alt={nickname} className="w-full h-full object-cover" />
      </div>
    )
  }
  return <BlobAvatar seed={nickname} size={size} className={className} />
}
