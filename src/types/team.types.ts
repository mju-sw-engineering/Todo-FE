export interface CreateTeamRequest {
  teamName: string
  teamImageKey?: string | null
}

export interface TeamResponse {
  id: number
  teamName: string
  teamImageUrl: string | null
}
