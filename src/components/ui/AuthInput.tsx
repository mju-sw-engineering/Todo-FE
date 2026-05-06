interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
}

export function AuthInput({ label, hint, id, ...props }: AuthInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-semibold text-primary tracking-wide">
        {label}
      </label>
      <input
        id={id}
        className="w-full px-4 py-[13px] rounded-[14px] border-[1.5px] border-border bg-input-bg text-[14px] text-ink placeholder:text-muted placeholder:font-light outline-none transition-all duration-200 focus:border-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(91,79,207,0.10)]"
        {...props}
      />
      {hint && <p className="text-xs text-red-400">{hint}</p>}
    </div>
  )
}
