import { postJson } from '@/lib/apiClient'
import type { CreateTeamRequest, TeamResponse } from '@/types/team.types'

export async function createTeam(request: CreateTeamRequest, token: string): Promise<TeamResponse> {
  return postJson<TeamResponse>('/api/teams', request, token)
}
