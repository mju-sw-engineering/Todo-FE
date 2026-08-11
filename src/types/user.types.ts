import type { AuthProvider } from '@/types/auth.types'

export interface MyTeam {
  teamId: number
  teamName: string
  teamImageUrl: string | null
}

export interface MyInfoResponse {
  userId: number
  /** 애플 계정은 null */
  loginId: string | null
  nickname: string
  profileImageUrl: string | null
  provider: AuthProvider
  teams: MyTeam[]
}
