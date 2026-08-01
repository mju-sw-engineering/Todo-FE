import type { FeedTeamRanking } from '@/types/feed.types'

export const MOCK_RANKINGS: FeedTeamRanking[] = [
  { teamId: 1, teamName: '우리팀', teamImageUrl: null, streakDays: 12, rank: 1 },
  { teamId: 2, teamName: '아침형인간', teamImageUrl: null, streakDays: 9, rank: 2 },
  { teamId: 3, teamName: '다이어터클럽', teamImageUrl: null, streakDays: 4, rank: 3 },
  { teamId: 4, teamName: '한강러너스', teamImageUrl: null, streakDays: 3, rank: 4 },
  { teamId: 5, teamName: '500마디', teamImageUrl: null, streakDays: 3, rank: 5 },
  { teamId: 6, teamName: '새벽독서단', teamImageUrl: null, streakDays: 2, rank: 6 },
]
