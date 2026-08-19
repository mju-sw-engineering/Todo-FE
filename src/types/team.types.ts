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

export interface InviteLinkResponse {
  /** 공유용 초대 링크 */
  inviteLink: string
  /** 만료 시각 (발급 후 7일) */
  expiresAt: string
}

/** 팀 벌집 성장 — 레벨 문턱값은 0/30/100/300 */
export interface TeamHiveResponse {
  /** 1~4 */
  level: number
  /** 팀이 함께 모은 누적 기록 수 ((팀원, 날짜, 투두) 고유 활동) */
  totalRecords: number
  /** 현재 레벨이 시작되는 기록 수 */
  currentThreshold: number
  /** 다음 레벨 기준값. 최고 레벨이면 null */
  nextThreshold: number | null
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
