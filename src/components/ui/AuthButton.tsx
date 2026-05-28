interface AuthButtonProps {
  children: React.ReactNode
  disabled?: boolean
  form?: string
}

export function AuthButton({ children, disabled, form }: AuthButtonProps) {
  return (
    <button
      type="submit"
      form={form}
      disabled={disabled}
      className="w-full py-[15px] mt-2 text-white text-[15px] font-semibold rounded-[16px] tracking-wide transition-all duration-200 hover:opacity-85 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: disabled ? '#999' : '#111111',
      }}
    >
      {children}
    </button>
  )
}
