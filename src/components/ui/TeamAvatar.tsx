import Image from 'next/image'

interface TeamAvatarProps {
  imageUrl: string | null
  name: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE = {
  sm: { wrapper: 'w-10 h-10', text: 'text-[15px]' },
  md: { wrapper: 'w-12 h-12', text: 'text-[18px]' },
  lg: { wrapper: 'w-14 h-14', text: 'text-[22px]' },
}

export function TeamAvatar({ imageUrl, name, size = 'md' }: TeamAvatarProps) {
  const { wrapper, text } = SIZE[size]
  return (
    <div
      className={`relative ${wrapper} shrink-0 rounded-full overflow-hidden border-2 border-primary/20 bg-primary-light`}
    >
      {imageUrl ? (
        <Image src={imageUrl} alt={name} fill className="object-cover" unoptimized />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className={`${text} font-bold text-primary`}>{name.charAt(0)}</span>
        </div>
      )}
    </div>
  )
}
