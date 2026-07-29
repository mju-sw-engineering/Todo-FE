import { Fragment, type ReactNode } from 'react'
import type { AvailabilityDateOption } from '@/types/availability.types'

interface AvailabilityGridShellProps {
  dateOptions: AvailabilityDateOption[]
  timeSlots: string[]
  renderCell: (date: string, time: string) => ReactNode
}

export function AvailabilityGridShell({
  dateOptions,
  timeSlots,
  renderCell,
}: AvailabilityGridShellProps) {
  return (
    <div
      className="grid gap-[3px] px-5 pb-2 select-none"
      style={{ gridTemplateColumns: `34px repeat(${dateOptions.length}, 1fr)` }}
    >
      <div />
      {dateOptions.map((opt) => (
        <div
          key={opt.date}
          className="text-[10px] font-bold text-center text-muted leading-tight pb-1"
        >
          {opt.label}
          <br />
          {opt.date}
        </div>
      ))}

      {timeSlots.map((time) => (
        <Fragment key={time}>
          <div className="text-[9px] font-semibold text-muted flex items-center justify-end pr-1 tabular-nums">
            {time}
          </div>
          {dateOptions.map((opt) => (
            <div key={`${opt.date}-${time}`} className="h-[18px]">
              {renderCell(opt.date, time)}
            </div>
          ))}
        </Fragment>
      ))}
    </div>
  )
}
