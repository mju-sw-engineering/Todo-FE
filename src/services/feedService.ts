import { getJson } from '@/lib/apiClient'
import type { MyStreak, TeamRhythm } from '@/types/feed.types'

export async function getTeamRhythm(token: string): Promise<TeamRhythm[]> {
  return getJson<TeamRhythm[]>('/api/feed/team-rhythm', token)
}

/** 기간을 생략하면 최근 16주. 서버가 월~일 완전한 주 단위로 확장해 돌려준다. */
export async function getMyStreak(
  token: string,
  startDate?: string,
  endDate?: string
): Promise<MyStreak> {
  if (!startDate || !endDate) {
    return getJson<MyStreak>('/api/feed/my-streak', token)
  }
  const params = new URLSearchParams({ startDate, endDate })
  return getJson<MyStreak>(`/api/feed/my-streak?${params}`, token)
}
