import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = '', label, hint, id, ...props },
  ref
) {
  const input = (
    <input
      ref={ref}
      id={id}
      className={[
        'w-full px-4 py-3.25 rounded-[14px] border-[1.5px] border-border bg-white',
        'text-[16px] text-ink placeholder:text-muted placeholder:font-light',
        'outline-none transition-all duration-200',
        'focus:border-primary focus:shadow-[0_0_0_3px_rgba(102,154,255,0.15)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )

  if (!label) return input

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-semibold text-gray-700 tracking-wide">
        {label}
      </label>
      {input}
      {hint && <p className="text-xs text-status-red">{hint}</p>}
    </div>
  )
})
