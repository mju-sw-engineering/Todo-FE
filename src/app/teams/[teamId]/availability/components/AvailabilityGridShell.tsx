import { Fragment, type ReactNode } from 'react'

export interface AvailabilityDateOption {
  label: string
  date: string
}

interface AvailabilityGridShellProps {
  dateOptions: AvailabilityDateOption[]
  timeSlots: string[]
  renderCell: (date: string, time: string) => ReactNode
}

function formatShortDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number)
  return `${m}/${d}`
}

export function AvailabilityGridShell({
  dateOptions,
  timeSlots,
  renderCell,
}: AvailabilityGridShellProps) {
  return (
    <div className="relative">
      <div className="overflow-x-auto scrollbar-hidden px-5 pb-2">
        <div
          className="grid gap-[3px] select-none"
          style={{ gridTemplateColumns: `34px repeat(${dateOptions.length}, minmax(80px, 1fr))` }}
        >
          <div />
          {dateOptions.map((opt) => {
            const dow = new Date(`${opt.date}T00:00:00`).getDay()
            const dowColor = dow === 0 ? 'text-status-red' : dow === 6 ? 'text-primary' : 'text-ink'
            return (
              <div key={opt.date} className="flex flex-col items-center gap-0.5 pb-1.5">
                <span className={`text-[11px] font-bold ${dowColor}`}>{opt.label}</span>
                <span className="text-[9.5px] font-medium text-muted tabular-nums">
                  {formatShortDate(opt.date)}
                </span>
              </div>
            )
          })}

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
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-linear-to-l from-white to-transparent" />
    </div>
  )
}
