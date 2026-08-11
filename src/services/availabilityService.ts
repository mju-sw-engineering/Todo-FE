import { getJson, postJson, putJson } from '@/lib/apiClient'
import type {
  AvailabilityPollListItem,
  AvailabilitySummaryResponse,
  CreateAvailabilityPollRequest,
  SubmitAvailabilityRequest,
} from '@/types/availability.types'

export async function getAvailabilityPolls(
  teamId: number,
  token: string
): Promise<AvailabilityPollListItem[]> {
  const data = await getJson<AvailabilityPollListItem[] | null>(
    `/api/teams/${teamId}/availability-polls`,
    token
  )
  return data ?? []
}

export async function createAvailabilityPoll(
  teamId: number,
  request: CreateAvailabilityPollRequest,
  token: string
): Promise<void> {
  await postJson<void>(`/api/teams/${teamId}/availability-polls`, request, token)
}

export async function getAvailabilitySummary(
  pollId: number,
  token: string
): Promise<AvailabilitySummaryResponse> {
  return getJson<AvailabilitySummaryResponse>(`/api/availability-polls/${pollId}/summary`, token)
}

export async function submitAvailabilityResponse(
  pollId: number,
  request: SubmitAvailabilityRequest,
  token: string
): Promise<void> {
  await putJson<void>(`/api/availability-polls/${pollId}/responses/me`, request, token)
}
