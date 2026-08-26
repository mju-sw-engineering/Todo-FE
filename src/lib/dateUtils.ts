export const MONTHS_KO = [
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
  '12월',
]

export const MONTHS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export const DAYS_KO = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

export const DAYS_SHORT_KO = ['일', '월', '화', '수', '목', '금', '토']

export function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** Date -> 'YYYY-MM-DD' (로컬 기준). API의 date 파라미터가 이 형식이다. */
export function toDateString(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function todayString(): string {
  return toDateString(new Date())
}

/** 'YYYY-MM-DD' -> 로컬 자정 Date. new Date(str)는 UTC로 파싱돼 하루 밀릴 수 있어 쓰지 않는다. */
export function parseDateString(date: string): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(date: string, days: number): string {
  const d = parseDateString(date)
  d.setDate(d.getDate() + days)
  return toDateString(d)
}

/** 해당 날짜가 속한 주의 월요일. 주간 스트립이 월~일이라 일요일은 이전 주로 본다. */
export function startOfWeekMonday(date: string): string {
  const d = parseDateString(date)
  const dow = d.getDay()
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  return toDateString(d)
}

/** 마감까지 남은 시간. 이미 지났으면 null이라 호출부에서 '지남'과 구분된다. */
export function formatISOTime(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '방금'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}
