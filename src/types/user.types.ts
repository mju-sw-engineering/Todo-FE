export interface MyTeam {
  teamId: number
  teamName: string
  teamImageUrl: string | null
}

export interface MyInfoResponse {
  userId: number
  loginId: string
  nickname: string
  profileImageUrl: string | null
  teams: MyTeam[]
}
