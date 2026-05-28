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
  'bg-primary-light text-primary',
  'bg-[#d4f0e4] text-[#2d7a56]',
  'bg-[#fde8d0] text-[#c25f1b]',
  'bg-[#e0d4f5] text-[#6b3fa0]',
]

export function getInitials(nickname: string): string {
  return (nickname ?? '').trim().slice(0, 2)
}
