import type {
  AvailabilityDateOption,
  AvailabilityEventDetail,
  AvailabilityEventListItem,
  AvailabilityEventSummary,
} from '@/types/availability.types'

export const MOCK_EVENTS: AvailabilityEventListItem[] = [
  {
    eventId: 1,
    title: '이번주 팀 회의',
    status: 'ONGOING',
    respondedCount: 2,
    totalCount: 4,
    myResponseSubmitted: false,
    dateRangeLabel: '월 7/28 ~ 수 7/30',
  },
  {
    eventId: 2,
    title: '회식 날짜 잡기',
    status: 'ONGOING',
    respondedCount: 4,
    totalCount: 4,
    myResponseSubmitted: true,
    dateRangeLabel: '전원 가능 시간 발견 🎉',
  },
  {
    eventId: 3,
    title: '지난주 스터디',
    status: 'CLOSED',
    respondedCount: 4,
    totalCount: 4,
    myResponseSubmitted: true,
    dateRangeLabel: '화 7/22 10:00 확정',
  },
]

const DATE_OPTIONS: AvailabilityDateOption[] = [
  { label: '월', date: '7/28' },
  { label: '화', date: '7/29' },
  { label: '수', date: '7/30' },
]

const TIME_SLOTS = ['09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20']

export const MOCK_EVENT_DETAIL: AvailabilityEventDetail = {
  eventId: 1,
  title: '이번주 팀 회의',
  dateOptions: DATE_OPTIONS,
  timeSlots: TIME_SLOTS,
}

const TOTAL_MEMBERS = 4

const SLOT_COUNTS: Record<string, string[]> = {
  '7/28|11': ['유진'],
  '7/28|12': ['유진'],
  '7/28|13': ['유진', '민서'],
  '7/28|14': ['유진', '민서'],
  '7/28|15': ['유진'],
  '7/28|16': ['유진'],
  '7/29|11': ['유진'],
  '7/29|12': ['유진', '민서'],
  '7/29|13': ['유진', '민서', '태오'],
  '7/29|14': ['유진', '민서', '태오', '하나'],
  '7/29|15': ['유진', '민서', '태오'],
  '7/29|16': ['유진', '민서'],
  '7/29|17': ['유진'],
  '7/30|14': ['유진'],
  '7/30|15': ['유진'],
  '7/30|16': ['유진'],
  '7/30|17': ['유진'],
  '7/30|18': ['유진', '민서'],
  '7/30|19': ['유진', '민서'],
  '7/30|20': ['유진'],
}

export const MOCK_EVENT_SUMMARY: AvailabilityEventSummary = {
  eventId: 1,
  title: '이번주 팀 회의',
  dateOptions: DATE_OPTIONS,
  timeSlots: TIME_SLOTS,
  slots: DATE_OPTIONS.flatMap(({ date }) =>
    TIME_SLOTS.map((time) => {
      const memberNames = SLOT_COUNTS[`${date}|${time}`] ?? []
      return { date, time, count: memberNames.length, total: TOTAL_MEMBERS, memberNames }
    })
  ),
}
