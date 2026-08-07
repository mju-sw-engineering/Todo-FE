export interface CardPalette {
  bg: string
  accent: string
  text: string
  badge: string
  badgeText?: string
}

/**
 * ConvexCard가 bg를 22% 불투명 틴트로 깔기 때문에 채도 있는 색이어야 파스텔로 보인다.
 * 카드가 흰 배경에서 서로 구분되도록 색을 순환시킨다.
 */
export const CARD_PALETTES: CardPalette[] = [
  {
    bg: '#6FA5FF',
    accent: '#4B8BFF',
    text: '#111111',
    badge: 'rgba(255,255,255,0.75)',
    badgeText: '#111111',
  },
  {
    bg: '#FF9E6B',
    accent: '#F07B3A',
    text: '#111111',
    badge: 'rgba(255,255,255,0.75)',
    badgeText: '#111111',
  },
  {
    bg: '#54C68F',
    accent: '#2FA874',
    text: '#111111',
    badge: 'rgba(255,255,255,0.75)',
    badgeText: '#111111',
  },
  {
    bg: '#FFC94D',
    accent: '#E8A413',
    text: '#111111',
    badge: 'rgba(255,255,255,0.75)',
    badgeText: '#111111',
  },
  {
    bg: '#F58BAD',
    accent: '#E2638D',
    text: '#111111',
    badge: 'rgba(255,255,255,0.75)',
    badgeText: '#111111',
  },
]
