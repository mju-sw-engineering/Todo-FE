import { useCallback, useEffect, useState } from 'react'

type Persona = 'ANGEL' | 'DEVIL'

interface PlayOptions {
  persona: Persona
  text?: string
  isSample?: boolean
}

const SAMPLE_TEXTS: Record<Persona, string> = {
  ANGEL:
    '안녕하세요! 저는 여러분의 든든한 천사 AI예요. 오늘도 함께라면 무엇이든 해낼 수 있어요. 작은 노력 하나하나가 쌓여서 큰 성장이 된답니다. 파이팅!',
  DEVIL: '나는 악마 AI다. 변명은 듣지 않겠어. 게으름을 피우면... 가만두지 않겠어. 각오는 됐는가?',
}

// Ordered by preference — first match wins
const VOICE_PRIORITY = [
  'Yuna',
  'com.apple.ttsbundle.Yuna-premium',
  'com.apple.ttsbundle.Yuna-compact',
  'SunHi',
  'Microsoft SunHi Online',
  'Google 한국의',
  'Heami',
]

const VOICE_SETTINGS: Record<Persona, { rate: number; pitch: number; volume: number }> = {
  ANGEL: { rate: 0.87, pitch: 1.32, volume: 1.0 },
  DEVIL: { rate: 0.94, pitch: 0.42, volume: 0.92 },
}

function getBestKoreanVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  const korean = voices.filter((v) => v.lang.startsWith('ko'))
  if (korean.length === 0) return null

  for (const name of VOICE_PRIORITY) {
    const match = korean.find((v) => v.name.includes(name))
    if (match) return match
  }

  // Prefer local (on-device) voices for better quality
  return korean.find((v) => v.localService) ?? korean[0]
}

export function useVoice() {
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activePersona, setActivePersona] = useState<Persona | null>(null)

  const stop = useCallback(() => {
    if (typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setActivePersona(null)
  }, [])

  useEffect(() => () => stop(), [stop])

  const play = useCallback(
    ({ persona, text, isSample }: PlayOptions) => {
      if (typeof window === 'undefined') return
      stop()

      const resolvedText = isSample ? SAMPLE_TEXTS[persona] : (text ?? '')
      if (!resolvedText) return

      setIsLoading(true)

      const speak = () => {
        const utterance = new SpeechSynthesisUtterance(resolvedText)
        utterance.lang = 'ko-KR'
        const s = VOICE_SETTINGS[persona]
        utterance.rate = s.rate
        utterance.pitch = s.pitch
        utterance.volume = s.volume

        const voice = getBestKoreanVoice()
        if (voice) utterance.voice = voice

        utterance.onstart = () => {
          setIsLoading(false)
          setIsPlaying(true)
          setActivePersona(persona)
        }
        utterance.onend = () => {
          setIsPlaying(false)
          setActivePersona(null)
        }
        utterance.onerror = () => {
          setIsLoading(false)
          setIsPlaying(false)
          setActivePersona(null)
        }

        window.speechSynthesis.speak(utterance)
      }

      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.onvoiceschanged = null
          speak()
        }
      } else {
        speak()
      }
    },
    [stop]
  )

  const toggle = useCallback(
    (options: PlayOptions) => {
      if (isPlaying && activePersona === options.persona) {
        stop()
      } else {
        play(options)
      }
    },
    [isPlaying, activePersona, play, stop]
  )

  return { play, stop, toggle, isPlaying, isLoading, activePersona }
}
