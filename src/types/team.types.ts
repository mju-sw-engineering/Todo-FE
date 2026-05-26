export type AiPersona = 'DEVIL' | 'ANGEL'

export interface CreateTeamRequest {
  teamName: string
  teamImageKey?: string | null
  aiPersona: AiPersona
}

export interface CreateTeamResponse {
  teamId: number
  teamName: string
  teamImage: string | null
  inviteCode: string
  aiPersona: AiPersona
  leaderId: number
  consecutiveTodoCount: number
  createdAt: string
}

export interface DailyEvaluationResponse {
  date: string
  persona: AiPersona
  message: string
}

export interface JoinTeamRequest {
  inviteCode: string
}

export interface JoinTeamResponse {
  teamId: number
}

export interface TeamListItem {
  teamId: number
  teamName: string
  teamImageUrl: string | null
  memberCount?: number
  successCount?: number
  continuousTodoCount?: number
}

export interface TeamListResponse {
  teams: TeamListItem[]
}

export interface TeamMember {
  userId: number
  nickname: string
  profileImageUrl: string | null
  role: 'LEADER' | 'MEMBER'
}

export interface TeamDetailResponse {
  teamId: number
  teamName: string
  teamImageUrl: string | null
  inviteCode?: string
  memberCount: number
  successCount: number
  continuousTodoCount: number
  members: TeamMember[]
}
