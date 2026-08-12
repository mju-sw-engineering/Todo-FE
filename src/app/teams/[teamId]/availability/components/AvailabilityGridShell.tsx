import { Fragment, type ReactNode } from 'react'

const WEEKDAY_SHORT = ['일', '월', '화', '수', '목', '금', '토']

function dateLabel(date: string): string {
  const dow = new Date(`${date}T00:00:00`).getDay()
  const [, m, d] = date.split('-').map(Number)
  return `${WEEKDAY_SHORT[dow]}\n${m}/${d}`
}

interface AvailabilityGridShellProps {
  dateOptions: string[]
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
      {dateOptions.map((date) => {
        const [dow, md] = dateLabel(date).split('\n')
        return (
          <div
            key={date}
            className="text-[10px] font-bold text-center text-muted leading-tight pb-1"
          >
            {dow}
            <br />
            {md}
          </div>
        )
      })}

      {timeSlots.map((time) => (
        <Fragment key={time}>
          <div className="text-[9px] font-semibold text-muted flex items-center justify-end pr-1 tabular-nums">
            {time}
          </div>
          {dateOptions.map((date) => (
            <div key={`${date}-${time}`} className="h-[18px]">
              {renderCell(date, time)}
            </div>
          ))}
        </Fragment>
      ))}
    </div>
  )
}
