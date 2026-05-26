import { getJson, postJson } from '@/lib/apiClient'
import type {
  CreateTeamRequest,
  CreateTeamResponse,
  DailyEvaluationResponse,
  JoinTeamRequest,
  JoinTeamResponse,
  TeamDetailResponse,
  TeamListResponse,
} from '@/types/team.types'

export async function createTeam(
  request: CreateTeamRequest,
  token: string
): Promise<CreateTeamResponse> {
  return postJson<CreateTeamResponse>('/api/teams', request, token)
}

export async function joinTeam(request: JoinTeamRequest, token: string): Promise<JoinTeamResponse> {
  return postJson<JoinTeamResponse>('/api/teams/join', request, token)
}

export async function getTeams(token: string): Promise<TeamListResponse> {
  return getJson<TeamListResponse>('/api/teams', token)
}

export async function getTeamById(teamId: number, token: string): Promise<TeamDetailResponse> {
  return getJson<TeamDetailResponse>(`/api/teams/${teamId}`, token)
}

export async function getDailyEvaluation(
  teamId: number,
  token: string
): Promise<DailyEvaluationResponse> {
  return getJson<DailyEvaluationResponse>(`/api/teams/${teamId}/daily-evaluation`, token)
}
