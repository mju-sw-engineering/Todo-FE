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
    'bg-primary text-white hover:bg-primary-hover hover:-translate-y-px active:scale-[0.99] disabled:translate-y-0',
  secondary: 'bg-neutral-30 text-neutral-100 hover:bg-neutral-40',
  danger: 'bg-status-red/10 text-status-red hover:bg-status-red/15',
  outline: 'border border-border text-ink hover:border-primary hover:text-primary',
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
