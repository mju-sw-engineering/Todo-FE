import type { DayStat } from '@/types/todo.types'

/**
 * 캘린더·주간 스트립의 날짜 점 색.
 * 두 화면이 같은 규칙을 써야 해서 여기 한 곳에만 둔다.
 *
 * 아직 지나지 않은 날은 성공률로 판단하지 않는다 — BE도 achievementRate를 null로 준다.
 * 빨강은 정말 무너진 날에만 쓴다.
 */
export function dayStatDotClass(stat: DayStat | undefined, isFuture: boolean): string | null {
  if (!stat || stat.total === 0) return null
  if (isFuture || stat.achievementRate === null) {
    return 'bg-transparent ring-[1.5px] ring-coolGray-50'
  }
  if (stat.achievementRate >= 80) return 'bg-primary'
  if (stat.achievementRate >= 40) return 'bg-primary/40'
  return 'bg-status-red'
}
