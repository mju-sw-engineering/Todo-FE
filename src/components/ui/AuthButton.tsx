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
      className="w-full py-[15px] mt-2 text-white text-[15px] font-semibold rounded-[16px] tracking-wide transition-all duration-200 hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
      style={{
        background: disabled ? '#E0B8CC' : 'linear-gradient(135deg, #D05B8E 0%, #FF8C7A 100%)',
        boxShadow: disabled ? 'none' : '0 6px 22px rgba(208, 91, 142, 0.35)',
      }}
    >
      {children}
    </button>
  )
}
