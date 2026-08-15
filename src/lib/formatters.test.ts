import { describe, expect, it } from 'vitest'
import { formatDate, formatDeadline, parseAchievementCount } from './formatters'

describe('formatDate', () => {
  it('월과 일을 한국어 형식으로 반환한다', () => {
    expect(formatDate(new Date(2026, 7, 13))).toBe('8월 13일')
  })

  it('1월 1일을 올바르게 반환한다', () => {
    expect(formatDate(new Date(2026, 0, 1))).toBe('1월 1일')
  })
})

describe('formatDeadline', () => {
  it('로컬 시각을 HH:mm 형식으로 반환한다', () => {
    expect(formatDeadline('2026-08-13T18:30:00')).toBe('18:30')
  })

  it('잘못된 날짜 문자열이면 입력을 그대로 반환한다', () => {
    expect(formatDeadline('invalid')).toBe('invalid')
  })
})

describe('parseAchievementCount', () => {
  it('"3/5" 형식을 파싱한다', () => {
    expect(parseAchievementCount('3/5')).toEqual({ achieved: 3, total: 5 })
  })

  it('공백이 섞여 있어도 파싱한다', () => {
    expect(parseAchievementCount(' 2 / 10 ')).toEqual({ achieved: 2, total: 10 })
  })

  it('형식이 다르면 0/0을 반환한다', () => {
    expect(parseAchievementCount('abc')).toEqual({ achieved: 0, total: 0 })
  })

  it('숫자가 아니면 0/0을 반환한다', () => {
    expect(parseAchievementCount('a/b')).toEqual({ achieved: 0, total: 0 })
  })
})
