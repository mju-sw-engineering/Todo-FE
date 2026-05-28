interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
}

export function AuthInput({ label, hint, id, ...props }: AuthInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-semibold text-gray-700 tracking-wide">
        {label}
      </label>
      <input
        id={id}
        className="w-full px-4 py-3.25 rounded-[14px] border-[1.5px] border-border bg-input-bg text-[14px] text-ink placeholder:text-muted placeholder:font-light outline-none transition-all duration-200 focus:border-gray-900 focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)]"
        {...props}
      />
      {hint && <p className="text-xs text-rose-400">{hint}</p>}
    </div>
  )
}
