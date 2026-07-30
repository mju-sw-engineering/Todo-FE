import type { FeedTeamRanking, FeedVerification } from '@/types/feed.types'

export const MOCK_RANKINGS: FeedTeamRanking[] = [
  { teamId: 1, teamName: '우리팀', teamImageUrl: null, streakDays: 12, rank: 1 },
  { teamId: 2, teamName: '아침형인간', teamImageUrl: null, streakDays: 9, rank: 2 },
  { teamId: 3, teamName: '다이어터클럽', teamImageUrl: null, streakDays: 4, rank: 3 },
]

export const MOCK_VERIFICATIONS: FeedVerification[] = [
  {
    verificationId: 1,
    teamId: 1,
    teamName: '우리팀',
    userId: 101,
    userNickname: '유진',
    userProfileImageUrl: null,
    todoTitle: '밥 먹기 인증 완료',
    verifiedAt: '방금 전',
    likeCount: 4,
    streakDays: 7,
  },
  {
    verificationId: 2,
    teamId: 2,
    teamName: '아침형인간',
    userId: 102,
    userNickname: '민서',
    userProfileImageUrl: null,
    todoTitle: '아침 독서 30분',
    verifiedAt: '18분 전',
    likeCount: 2,
    streakDays: 9,
  },
]
