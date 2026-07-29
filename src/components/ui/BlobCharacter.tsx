interface BlobProps {
  size?: number
  className?: string
}

export function AiIcon({ size = 80, className = '' }: BlobProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2.5 L14 9.5 L21 11.5 L14 13.5 L12 20.5 L10 13.5 L3 11.5 L10 9.5 Z"
        fill="white"
      />
    </svg>
  )
}
