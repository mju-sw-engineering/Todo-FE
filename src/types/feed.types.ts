/** 팀 리듬: 한 주치 요일별 참여 팀원 수 (월~일, 아직 오지 않은 날은 null) */
export interface TeamWeekRhythm {
  /** 그 주 월요일 ISO 날짜 (예: '2026-08-03') */
  startDate: string
  /** 길이 7. 진행 또는 완료를 남긴 팀원 수 */
  counts: (number | null)[]
}

export interface TeamRhythm {
  teamId: number
  teamName: string
  memberCount: number
  streakDays: number
  /** 오래된 주 → 최신 주 순서. 최신이 이번 주 */
  weeks: TeamWeekRhythm[]
  /** 오늘 참여한 팀원 (아바타 표시용, 앞 3명만 노출) */
  todayMembers: { userId: number; name: string }[]
}

/** 나의 꾸준함 잔디: 0=없음, 1=1개, 2=2개, 3=3개 이상 */
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
