interface PrimaryAction {
  label: string
  onClick?: () => void
  type?: 'submit' | 'button'
  form?: string
  disabled?: boolean
}

interface SecondaryAction {
  label: string
  onClick: () => void
  disabled?: boolean
}

interface BottomActionsProps {
  primary: PrimaryAction
  secondary?: SecondaryAction
  dangerText?: SecondaryAction
}

export function BottomActions({ primary, secondary, dangerText }: BottomActionsProps) {
  return (
    <div className="px-6 py-5 border-t border-border flex flex-col gap-3">
      <button
        type={primary.type ?? 'button'}
        form={primary.form}
        onClick={primary.onClick}
        disabled={primary.disabled}
        className="w-full py-3.75 bg-gray-900 text-white text-[15px] font-semibold rounded-[14px] transition-all duration-200 hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {primary.label}
      </button>
      {secondary && (
        <button
          type="button"
          onClick={secondary.onClick}
          disabled={secondary.disabled}
          className="w-full py-3.75 bg-gray-100 text-gray-700 text-[15px] font-semibold rounded-[14px] transition-all duration-200 hover:bg-gray-200 disabled:opacity-50"
        >
          {secondary.label}
        </button>
      )}
      {dangerText && (
        <button
          type="button"
          onClick={dangerText.onClick}
          disabled={dangerText.disabled}
          className="w-full py-3 text-[14px] font-semibold text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
        >
          {dangerText.label}
        </button>
      )}
    </div>
  )
}
