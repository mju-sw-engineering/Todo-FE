interface AuthButtonProps {
  children: React.ReactNode
  disabled?: boolean
}

export function AuthButton({ children, disabled }: AuthButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full py-[15px] mt-2 bg-primary text-white text-[15px] font-semibold rounded-[14px] tracking-wide shadow-[0_4px_18px_rgba(91,79,207,0.22)] transition-all duration-200 hover:bg-primary-hover hover:-translate-y-px hover:shadow-[0_8px_28px_rgba(91,79,207,0.28)] active:translate-y-0 active:shadow-[0_2px_10px_rgba(91,79,207,0.18)] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
    >
      {children}
    </button>
  )
}
