export interface CardPalette {
  bg: string
  accent: string
  text: string
  badge: string
  badgeText?: string
}

export const CARD_PALETTES: CardPalette[] = [
  {
    bg: '#FFFFFF',
    accent: '#669AFF',
    text: '#111111',
    badge: 'rgba(255,255,255,0.75)',
    badgeText: '#111111',
  },
]
