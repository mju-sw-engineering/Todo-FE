export type AvailabilityEventStatus = 'ONGOING' | 'CLOSED'

export interface AvailabilityEventListItem {
  eventId: number
  title: string
  status: AvailabilityEventStatus
  respondedCount: number
  totalCount: number
  myResponseSubmitted: boolean
  dateRangeLabel: string
  resultLabel?: string
}

export interface AvailabilityDateOption {
  label: string
  date: string
}

export interface AvailabilityEventDetail {
  eventId: number
  title: string
  dateOptions: AvailabilityDateOption[]
  timeSlots: string[]
}

export interface AvailabilitySlotSummary {
  date: string
  time: string
  count: number
  total: number
  memberNames: string[]
}

export interface AvailabilityEventSummary {
  eventId: number
  title: string
  dateOptions: AvailabilityDateOption[]
  timeSlots: string[]
  slots: AvailabilitySlotSummary[]
}
