export interface CreateTeamRequest {
  teamName: string
  teamImageKey?: string | null
}

export interface CreateTeamResponse {
  teamId: number
  teamName: string
  teamImage: string | null
  inviteCode: string
  leaderId: number
  consecutiveTodoCount: number
  createdAt: string
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
