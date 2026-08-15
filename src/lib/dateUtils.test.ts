import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatISOTime, formatRelativeTime, pad } from './dateUtils'

describe('pad', () => {
  it('한 자리 수를 두 자리로 채운다', () => {
    expect(pad(5)).toBe('05')
  })

  it('두 자리 수는 그대로 둔다', () => {
    expect(pad(12)).toBe('12')
  })

  it('0을 00으로 채운다', () => {
    expect(pad(0)).toBe('00')
  })
})

describe('formatISOTime', () => {
  it('로컬 시각을 HH:mm 형식으로 반환한다', () => {
    // 타임존 오프셋 없는 ISO 문자열은 로컬 시각으로 해석된다
    expect(formatISOTime('2026-08-13T09:05:00')).toBe('09:05')
  })

  it('자정을 00:00으로 반환한다', () => {
    expect(formatISOTime('2026-08-13T00:00:00')).toBe('00:00')
  })

  it('잘못된 날짜 문자열이면 빈 문자열을 반환한다', () => {
    expect(formatISOTime('not-a-date')).toBe('')
  })
})

describe('formatRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function setNow(iso: string) {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(iso))
  }

  it('1분 미만이면 "방금"을 반환한다', () => {
    setNow('2026-08-13T12:00:30')
    expect(formatRelativeTime('2026-08-13T12:00:00')).toBe('방금')
  })

  it('1시간 미만이면 분 단위로 반환한다', () => {
    setNow('2026-08-13T12:45:00')
    expect(formatRelativeTime('2026-08-13T12:00:00')).toBe('45분 전')
  })

  it('24시간 미만이면 시간 단위로 반환한다', () => {
    setNow('2026-08-13T15:00:00')
    expect(formatRelativeTime('2026-08-13T12:00:00')).toBe('3시간 전')
  })

  it('24시간 이상이면 일 단위로 반환한다', () => {
    setNow('2026-08-15T12:00:00')
    expect(formatRelativeTime('2026-08-13T12:00:00')).toBe('2일 전')
  })
})
