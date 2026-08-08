import { getJson } from '@/lib/apiClient'
import type { HiveArchiveMonth, MonthlyHive, TeamRhythm } from '@/types/feed.types'

export async function getTeamRhythms(token: string): Promise<TeamRhythm[]> {
  return getJson<TeamRhythm[]>('/api/feed/team-rhythm', token)
}

/** year/month 생략 시 서버 기준 이번 달 */
export async function getMonthlyHive(
  token: string,
  year?: number,
  month?: number
): Promise<MonthlyHive> {
  const params = new URLSearchParams()
  if (year != null) params.set('year', String(year))
  if (month != null) params.set('month', String(month))
  const qs = params.toString()
  return getJson<MonthlyHive>(`/api/feed/hive${qs ? `?${qs}` : ''}`, token)
}

/** 이번 달을 제외한 직전 months개월. 오래된 달 → 최신 달 순서 */
export async function getHiveArchive(token: string, months = 3): Promise<HiveArchiveMonth[]> {
  return getJson<HiveArchiveMonth[]>(`/api/feed/hive/archive?months=${months}`, token)
}
