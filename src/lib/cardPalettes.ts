export interface CardPalette {
  bg: string
  accent: string
  text: string
  badge: string
  badgeText?: string
}

export const CARD_PALETTES: CardPalette[] = [
  {
    bg: 'linear-gradient(135deg,#FFCDC8 0%,#FFDBD7 45%,#FFE8E5 100%)',
    accent: '#C83030',
    text: '#6A1010',
    badge: 'rgba(255,255,255,0.75)',
    badgeText: '#6A1010',
  },
  {
    bg: 'linear-gradient(135deg,#FFD6E8 0%,#FFE4F0 45%,#FFF0F7 100%)',
    accent: '#B83078',
    text: '#6A0840',
    badge: 'rgba(255,255,255,0.75)',
    badgeText: '#6A0840',
  },
  {
    bg: 'linear-gradient(135deg,#C8F0D0 0%,#D8F5DC 45%,#EAFAEC 100%)',
    accent: '#208840',
    text: '#0A3818',
    badge: 'rgba(255,255,255,0.75)',
    badgeText: '#0A3818',
  },
  {
    bg: 'linear-gradient(135deg,#C8E4FF 0%,#D8EDFF 45%,#EBF5FF 100%)',
    accent: '#1A68C8',
    text: '#0A2858',
    badge: 'rgba(255,255,255,0.75)',
    badgeText: '#0A2858',
  },
  {
    bg: 'linear-gradient(135deg,#FFF0B3 0%,#FFF5CC 45%,#FFFAE5 100%)',
    accent: '#A87800',
    text: '#3A2800',
    badge: 'rgba(255,255,255,0.75)',
    badgeText: '#3A2800',
  },
]
