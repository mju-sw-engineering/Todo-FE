interface SpinnerProps {
  size?: 'sm' | 'md'
}

export function Spinner({ size = 'md' }: SpinnerProps) {
  const cls = size === 'sm' ? 'w-6 h-6 border-2' : 'w-8 h-8 border-[3px]'
  return <div className={`${cls} border-gray-900 border-t-transparent rounded-full animate-spin`} />
}
