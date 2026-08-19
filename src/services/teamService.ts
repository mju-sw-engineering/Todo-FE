import { deleteJson, getJson, postJson } from '@/lib/apiClient'
import { cachedRequest, invalidateCache } from '@/lib/requestCache'
import type {
  CreateTeamRequest,
  CreateTeamResponse,
  InviteLinkResponse,
  JoinTeamRequest,
  JoinTeamResponse,
  TeamDetailResponse,
  TeamHiveResponse,
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

/** 팀 벌집 성장 상태 — 기록 수가 자주 변하므로 캐시하지 않는다 */
export async function getTeamHive(teamId: number, token: string): Promise<TeamHiveResponse> {
  return getJson<TeamHiveResponse>(`/api/teams/${teamId}/hive`, token)
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

export async function joinTeamByInviteLink(
  linkToken: string,
  token: string
): Promise<JoinTeamResponse> {
  const result = await postJson<JoinTeamResponse>(
    '/api/teams/invite-link/join',
    { token: linkToken },
    token
  )
  invalidateCache('teams')
  return result
}

export async function removeMember(
  teamId: number,
  targetUserId: number,
  token: string
): Promise<void> {
  await deleteJson<void>(`/api/teams/${teamId}/members/${targetUserId}`, token)
  invalidateCache(`team:${teamId}`)
}

export async function leaveTeam(teamId: number, token: string): Promise<void> {
  await deleteJson<void>(`/api/teams/${teamId}/leave`, token)
  invalidateCache('teams')
  invalidateCache(`team:${teamId}`)
}

/** 유효한 링크가 있으면 그대로, 없거나 만료됐으면 새로 발급(7일)해서 반환한다 */
export async function getOrCreateInviteLink(
  teamId: number,
  token: string
): Promise<InviteLinkResponse> {
  return postJson<InviteLinkResponse>(`/api/teams/${teamId}/invite-link`, {}, token)
}
