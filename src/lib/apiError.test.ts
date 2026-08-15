import { describe, expect, it } from 'vitest'
import { ApiError } from './apiClient'
import { getErrorMessage } from './apiError'

describe('getErrorMessage', () => {
  it('ApiError가 아니면 fallback을 반환한다', () => {
    expect(getErrorMessage(new Error('boom'), '실패했습니다.')).toBe('실패했습니다.')
    expect(getErrorMessage('string error', '실패했습니다.')).toBe('실패했습니다.')
    expect(getErrorMessage(undefined, '실패했습니다.')).toBe('실패했습니다.')
  })

  it('ApiError면 서버 메시지를 반환한다', () => {
    expect(getErrorMessage(new ApiError('서버 오류', 500), '실패했습니다.')).toBe('서버 오류')
  })

  it('상태 코드에 매핑된 메시지가 있으면 우선한다', () => {
    const err = new ApiError('서버 오류', 404)
    expect(getErrorMessage(err, '실패했습니다.', { 404: '찾을 수 없습니다.' })).toBe(
      '찾을 수 없습니다.'
    )
  })

  it('상태 코드 매핑이 없으면 서버 메시지로 폴백한다', () => {
    const err = new ApiError('서버 오류', 500)
    expect(getErrorMessage(err, '실패했습니다.', { 404: '찾을 수 없습니다.' })).toBe('서버 오류')
  })

  it('ApiError 메시지가 비어 있으면 fallback을 반환한다', () => {
    expect(getErrorMessage(new ApiError('', 500), '실패했습니다.')).toBe('실패했습니다.')
  })
})
