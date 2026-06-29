type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className = '', ...props }: TextareaProps) {
  return (
    <textarea
      className={[
        'w-full px-4 py-3.25 rounded-[14px] border-[1.5px] border-border bg-white',
        'text-[14px] text-ink placeholder:text-muted placeholder:font-light',
        'outline-none transition-all duration-200 resize-none',
        'focus:border-gray-900 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}
