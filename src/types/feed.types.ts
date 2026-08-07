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

export interface MyStreakDay {
  /** ISO 날짜 */
  date: string
  /** 그날 기록을 남긴 서로 다른 투두 수. 색 매핑은 프론트 정책 */
  count: number
}

export interface MyStreak {
  /** 오래된 날 → 오늘 순서. 16주 = 112일 */
  days: MyStreakDay[]
  currentStreak: number
}
