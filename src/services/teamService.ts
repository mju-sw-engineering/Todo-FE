import { getJson, postJson } from '@/lib/apiClient'
import { cachedRequest, invalidateCache } from '@/lib/requestCache'
import type {
  CreateTeamRequest,
  CreateTeamResponse,
  DailyEvaluationResponse,
  JoinTeamRequest,
  JoinTeamResponse,
  TeamDetailResponse,
  TeamListResponse,
} from '@/types/team.types'

export async function getTeams(token: string): Promise<TeamListResponse> {
  return cachedRequest('teams', () => getJson<TeamListResponse>('/api/teams', token), 60_000)
}

export async function getTeamById(teamId: number, token: string): Promise<TeamDetailResponse> {
  return cachedRequest(
    `team:${teamId}`,
    () => getJson<TeamDetailResponse>(`/api/teams/${teamId}`, token),
    60_000
  )
}

export async function getDailyEvaluation(
  teamId: number,
  token: string
): Promise<DailyEvaluationResponse> {
  return cachedRequest(
    `eval:${teamId}`,
    () => getJson<DailyEvaluationResponse>(`/api/teams/${teamId}/daily-evaluation`, token),
    300_000
  )
}

export async function createTeam(
  request: CreateTeamRequest,
  token: string
): Promise<CreateTeamResponse> {
  const result = await postJson<CreateTeamResponse>('/api/teams', request, token)
  invalidateCache('teams')
  return result
}

export async function joinTeam(request: JoinTeamRequest, token: string): Promise<JoinTeamResponse> {
  const result = await postJson<JoinTeamResponse>('/api/teams/join', request, token)
  invalidateCache('teams')
  return result
}
