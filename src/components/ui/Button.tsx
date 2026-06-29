interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const SIZE = {
  sm: 'py-3 text-[14px]',
  md: 'py-3.75 text-[15px]',
  lg: 'py-4 text-[15px]',
}

const VARIANT = {
  primary:
    'bg-gray-900 text-white hover:opacity-85 hover:-translate-y-px active:scale-[0.99] disabled:translate-y-0',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  danger: 'text-red-500 hover:text-red-600',
  outline: 'border border-border text-ink hover:border-gray-900 hover:text-gray-900',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const cls = [
    'font-semibold rounded-[14px] transition-all duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    SIZE[size],
    VARIANT[variant],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={cls} {...props}>
      {children}
    </button>
  )
}
