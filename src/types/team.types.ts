export interface CreateTeamRequest {
  teamName: string
  /** 팀 한 줄 소개 (선택, 최대 100자) */
  description?: string | null
  teamImageKey?: string | null
}

export interface CreateTeamResponse {
  teamId: number
  teamName: string
  description: string | null
  teamImage: string | null
  inviteCode: string
  leaderId: number
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
  description?: string | null
  teamImageUrl: string | null
  memberCount?: number
  successCount?: number
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
  description?: string | null
  teamImageUrl: string | null
  inviteCode?: string
  memberCount: number
  successCount: number
  members: TeamMember[]
}
