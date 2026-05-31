export function formatDate(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}

export function formatDeadline(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

export function parseAchievementCount(value: string): { achieved: number; total: number } {
  const parts = value.split('/')
  if (parts.length === 2) {
    const achieved = parseInt(parts[0].trim(), 10)
    const total = parseInt(parts[1].trim(), 10)
    if (!isNaN(achieved) && !isNaN(total)) return { achieved, total }
  }
  return { achieved: 0, total: 0 }
}

export const AVATAR_COLORS = [
  'bg-[#C8E8FF] text-[#1A5A90]',
  'bg-[#C8F0D0] text-[#1A6030]',
  'bg-[#FFF0B3] text-[#7A5A00]',
  'bg-[#FFD6E8] text-[#7A1A4A]',
]

export function getInitials(nickname: string): string {
  return (nickname ?? '').trim().slice(0, 2)
}
