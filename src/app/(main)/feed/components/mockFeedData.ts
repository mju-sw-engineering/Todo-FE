import type { FeedBadge } from '@/types/feed.types'

/** 배지 API(BE)가 아직 없어 임시 목데이터로 표시한다 */
export const MOCK_BADGES: FeedBadge[] = [
  { id: 'first-honey', label: '첫 꿀', icon: 'drop', acquired: true },
  { id: 'streak-7', label: '7일 연속', icon: 'bee', acquired: true },
  { id: 'first-full-hive', label: '첫 완주', icon: 'hive', acquired: true },
  { id: 'streak-30', label: '30일 연속', icon: 'bee', acquired: false },
  { id: 'full-hive-3', label: '3개월 완주', icon: 'hive', acquired: false },
  { id: 'team-all-in', label: '팀 전원 참여', icon: 'drop', acquired: false },
]
