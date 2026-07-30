export interface FeedTeamRanking {
  teamId: number
  teamName: string
  teamImageUrl: string | null
  streakDays: number
  rank: number
}

export interface FeedVerification {
  verificationId: number
  teamId: number
  teamName: string
  userId: number
  userNickname: string
  userProfileImageUrl: string | null
  todoTitle: string
  verifiedAt: string
  likeCount: number
  streakDays: number
}
