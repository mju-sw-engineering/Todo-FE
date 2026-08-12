export interface AvailabilityPollListItem {
  id: number
  title: string
  dateOptions: string[]
  totalMemberCount: number
  respondedCount: number
  myResponded: boolean
  allResponded: boolean
}

export interface CreateAvailabilityPollRequest {
  title: string
  dateOptions: string[]
  startHour: number
  endHour: number
}

export interface AvailabilitySlot {
  date: string
  hour: number
}

export interface SubmitAvailabilityRequest {
  slots: AvailabilitySlot[]
}

export interface HeatmapSlot {
  date: string
  hour: number
  count: number
  members: string[]
}

export interface AvailabilitySummaryResponse {
  pollId: number
  title: string
  dateOptions: string[]
  startHour: number
  endHour: number
  totalMemberCount: number
  respondedCount: number
  allResponded: boolean
  mySlots: AvailabilitySlot[]
  heatmap: HeatmapSlot[]
  bestSlot: HeatmapSlot | null
}
