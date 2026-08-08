/** 팀 리듬: 한 주치 요일별 참여 팀원 수 (월~일, 아직 오지 않은 날은 null) */
export interface TeamWeekRhythm {
  /** 그 주 월요일 ISO 날짜 (예: '2026-08-03') */
  startDate: string
  /** 길이 7. 진행 또는 완료를 남긴 팀원 수 */
  counts: (number | null)[]
}

export interface TeamRhythmMember {
  userId: number
  name: string
}

export interface TeamRhythm {
  teamId: number
  teamName: string
  memberCount: number
  streakDays: number
  /** 오래된 주 → 최신 주 순서. 최신이 이번 주 */
  weeks: TeamWeekRhythm[]
  /** 오늘 참여한 팀원 (아바타 표시용, 앞 3명만 노출) */
  todayMembers: TeamRhythmMember[]
}

/** 꿀 진하기: 그날 손댄(생성·체크인·제출) 서로 다른 투두 수. 0=없음, 3=3개 이상 */
export type StreakLevel = 0 | 1 | 2 | 3

export interface MyStreakDay {
  /** ISO 날짜 */
  date: string
  level: StreakLevel
}

export interface MyStreak {
  /** 오래된 날 → 오늘 순서. 16주 = 112일 */
  days: MyStreakDay[]
  currentStreak: number
}

/** 이번 달 벌집 채우기: 하루 = 1칸, level은 그날 활동한 투두 수에 따른 꿀 진하기 */
export interface MonthlyHive {
  year: number
  /** 1~12 */
  month: number
  /** 1일부터 말일까지. 오늘 이후는 null */
  dayLevels: (StreakLevel | null)[]
  currentStreak: number
}

/** 벌집 보관함의 한 달 */
export interface HiveArchiveMonth {
  year: number
  /** 1~12 */
  month: number
  /** 꿀을 채운 날 수 */
  filledDays: number
  totalDays: number
  /** 이번 달(진행 중) 여부 */
  inProgress?: boolean
}

export interface FeedBadge {
  id: string
  label: string
  /** 아이콘 종류: 꿀방울 / 벌 / 벌집. 미획득이면 잠금으로 표시 */
  icon: 'drop' | 'bee' | 'hive'
  acquired: boolean
}
