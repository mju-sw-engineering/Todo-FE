interface BlobAvatarProps {
  seed: string
  size?: number
  className?: string
}

export function BlobAvatar({ seed, size = 40, className = '' }: BlobAvatarProps) {
  const initial = seed.trim().charAt(0).toUpperCase() || '?'

  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 bg-neutral-40 ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="font-bold leading-none text-neutral-100" style={{ fontSize: size * 0.4 }}>
        {initial}
      </span>
    </div>
  )
}
