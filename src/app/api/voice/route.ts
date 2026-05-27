import { NextRequest, NextResponse } from 'next/server'

const VOICE_IDS = {
  ANGEL: '21m00Tcm4TlvDq8ikWAM', // Rachel - warm, gentle
  DEVIL: 'yoZ06aMxZJJ28mfd3POQ', // Sam - raspy, intense
}

const SAMPLE_TEXTS = {
  ANGEL:
    '안녕하세요! 저는 천사 AI예요. 여러분의 노력을 진심으로 응원하고, 함께 목표를 달성해나갈 거예요. 기대해도 좋아요!',
  DEVIL: '흠, 나와 함께하겠다고? 나는 악마 AI야. 게으름은 절대 용납 못 해. 각오는 됐어?',
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Voice API not configured' }, { status: 503 })
  }

  const { text, persona, isSample } = await request.json().catch(() => ({}))

  const resolvedText: string = isSample ? SAMPLE_TEXTS[persona as keyof typeof SAMPLE_TEXTS] : text

  const voiceId = VOICE_IDS[persona as keyof typeof VOICE_IDS]
  if (!voiceId || !resolvedText) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  }

  const isDevil = persona === 'DEVIL'

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: resolvedText,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: isDevil ? 0.3 : 0.65,
        similarity_boost: 0.75,
        style: isDevil ? 0.7 : 0.2,
        use_speaker_boost: true,
      },
    }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'ElevenLabs error' }, { status: res.status })
  }

  const buffer = await res.arrayBuffer()
  return new NextResponse(buffer, { headers: { 'Content-Type': 'audio/mpeg' } })
}
