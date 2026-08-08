import type {
  FeedBadge,
  HiveArchiveMonth,
  MonthlyHive,
  MyStreak,
  StreakLevel,
  TeamRhythm,
} from '@/types/feed.types'

export const MOCK_TEAM_RHYTHMS: TeamRhythm[] = [
  {
    teamId: 1,
    teamName: '우리팀',
    memberCount: 5,
    streakDays: 6,
    weeks: [
      { startDate: '2026-07-20', counts: [3, 2, 4, 4, 2, 1, 0] },
      { startDate: '2026-07-27', counts: [4, 3, 3, 5, 4, 0, 1] },
      { startDate: '2026-08-03', counts: [2, 4, 3, 1, 3, null, null] },
    ],
    todayMembers: [
      { userId: 1, name: '나' },
      { userId: 2, name: '준서' },
      { userId: 3, name: '하은' },
    ],
  },
  {
    teamId: 2,
    teamName: '다이어터클럽',
    memberCount: 4,
    streakDays: 4,
    weeks: [
      { startDate: '2026-07-20', counts: [1, 2, 2, 0, 3, 1, 0] },
      { startDate: '2026-07-27', counts: [2, 2, 1, 3, 2, 0, 0] },
      { startDate: '2026-08-03', counts: [3, 1, 2, 2, 2, null, null] },
    ],
    todayMembers: [
      { userId: 1, name: '나' },
      { userId: 4, name: '태오' },
    ],
  },
  {
    teamId: 3,
    teamName: '한강러너스',
    memberCount: 6,
    streakDays: 1,
    weeks: [
      { startDate: '2026-07-20', counts: [2, 0, 1, 0, 2, 4, 3] },
      { startDate: '2026-07-27', counts: [1, 1, 0, 2, 1, 3, 2] },
      { startDate: '2026-08-03', counts: [0, 2, 1, 0, 1, null, null] },
    ],
    todayMembers: [{ userId: 1, name: '나' }],
  },
]

/** 16주(112일) 목데이터 — 2026-04-20(월) ~ 2026-08-09(일) */
const LEVELS: StreakLevel[][] = [
  [0, 1, 1, 0, 0, 0, 1],
  [1, 1, 1, 1, 0, 0, 0],
  [0, 2, 1, 2, 0, 1, 0],
  [1, 2, 2, 1, 0, 0, 0],
  [0, 1, 2, 1, 0, 0, 1],
  [1, 2, 1, 2, 1, 0, 0],
  [0, 2, 2, 1, 0, 0, 0],
  [1, 1, 2, 1, 0, 1, 0],
  [0, 2, 1, 1, 0, 0, 0],
  [1, 1, 2, 2, 1, 0, 0],
  [0, 1, 1, 0, 0, 0, 1],
  [1, 3, 2, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 0],
  [1, 2, 1, 0, 0, 0, 1],
  [0, 1, 2, 1, 0, 0, 0],
  [1, 1, 3, 1, 2, 0, 0],
]

const FIRST_MONDAY = new Date('2026-04-20')

export const MOCK_MY_STREAK: MyStreak = {
  currentStreak: 5,
  days: LEVELS.flatMap((week, wi) =>
    week.map((level, di) => {
      const d = new Date(FIRST_MONDAY)
      d.setDate(d.getDate() + wi * 7 + di)
      return { date: d.toISOString().slice(0, 10), level }
    })
  ),
}

/** 이번 달 벌집 목데이터 — 오늘(로컬 기준)까지 채우고 이후는 null */
export function buildMockMonthlyHive(): MonthlyHive {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const totalDays = new Date(year, month, 0).getDate()
  const today = now.getDate()
  const pattern: StreakLevel[] = [2, 1, 3, 2, 1, 2, 3, 1, 2, 2]
  const dayLevels = Array.from({ length: totalDays }, (_, i) =>
    i + 1 > today ? null : pattern[i % pattern.length]
  )
  // 스트릭은 표시 데이터와 어긋나지 않도록 dayLevels에서 직접 계산한다
  let currentStreak = 0
  for (let i = today - 1; i >= 0; i--) {
    const lv = dayLevels[i]
    if (lv === null || lv === 0) break
    currentStreak++
  }
  return { year, month, dayLevels, currentStreak }
}

export const MOCK_HIVE_ARCHIVE: HiveArchiveMonth[] = [
  { year: 2026, month: 5, filledDays: 31, totalDays: 31 },
  { year: 2026, month: 6, filledDays: 18, totalDays: 30 },
  { year: 2026, month: 7, filledDays: 31, totalDays: 31 },
]

export const MOCK_BADGES: FeedBadge[] = [
  { id: 'first-honey', label: '첫 꿀', icon: 'drop', acquired: true },
  { id: 'streak-7', label: '7일 연속', icon: 'bee', acquired: true },
  { id: 'first-full-hive', label: '첫 완주', icon: 'hive', acquired: true },
  { id: 'streak-30', label: '30일 연속', icon: 'bee', acquired: false },
  { id: 'full-hive-3', label: '3개월 완주', icon: 'hive', acquired: false },
  { id: 'team-all-in', label: '팀 전원 참여', icon: 'drop', acquired: false },
]
