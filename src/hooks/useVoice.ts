import { useCallback, useEffect, useRef, useState } from 'react'

type Persona = 'ANGEL' | 'DEVIL'

interface PlayOptions {
  persona: Persona
  text?: string
  isSample?: boolean
}

export function useVoice() {
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activePersona, setActivePersona] = useState<Persona | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const urlRef = useRef<string | null>(null)

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.onended = null
      audioRef.current.onerror = null
      audioRef.current = null
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
    }
    setIsPlaying(false)
    setActivePersona(null)
  }, [])

  useEffect(() => () => stop(), [stop])

  const play = useCallback(
    async ({ persona, text, isSample }: PlayOptions) => {
      stop()
      setIsLoading(true)
      try {
        const res = await fetch('/api/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ persona, text, isSample }),
        })
        if (!res.ok) return

        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        urlRef.current = url

        const audio = new Audio(url)
        audioRef.current = audio
        setActivePersona(persona)

        audio.onended = () => {
          setIsPlaying(false)
          setActivePersona(null)
          URL.revokeObjectURL(url)
          urlRef.current = null
        }
        audio.onerror = () => {
          setIsPlaying(false)
          setActivePersona(null)
        }

        await audio.play()
        setIsPlaying(true)
      } catch {
        // silently fail if API not configured
      } finally {
        setIsLoading(false)
      }
    },
    [stop]
  )

  const toggle = useCallback(
    async (options: PlayOptions) => {
      if (isPlaying && activePersona === options.persona) {
        stop()
      } else {
        await play(options)
      }
    },
    [isPlaying, activePersona, play, stop]
  )

  return { play, stop, toggle, isPlaying, isLoading, activePersona }
}
