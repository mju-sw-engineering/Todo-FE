interface SpinnerProps {
  size?: 'sm' | 'md'
  variant?: 'default' | 'track'
}

export function Spinner({ size = 'md', variant = 'default' }: SpinnerProps) {
  const sizeClass = size === 'sm' ? 'w-6 h-6 border-2' : 'w-8 h-8 border-[3px]'
  const colorClass =
    variant === 'track'
      ? 'border-gray-300 border-t-gray-900'
      : 'border-gray-900 border-t-transparent'
  return <div className={`${sizeClass} ${colorClass} rounded-full animate-spin`} />
}
