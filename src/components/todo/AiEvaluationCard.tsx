'use client'

import { useVoice } from '@/hooks/useVoice'
import { AngelBlob, DevilBlob } from '@/components/ui/BlobCharacter'
import { MONTHS_KO } from '@/lib/dateUtils'
import type { DailyEvaluationResponse } from '@/types/team.types'

function formatEvalDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${MONTHS_KO[d.getMonth()]} ${d.getDate()}일 평가`
}

interface AiEvaluationCardProps {
  evaluation: DailyEvaluationResponse | 'error' | 'loading'
}

export function AiEvaluationCard({ evaluation }: AiEvaluationCardProps) {
  const voice = useVoice()

  if (evaluation === 'loading') {
    return (
      <div className="mx-5 mb-4 rounded-2xl bg-gray-50 px-4 py-3 flex items-center justify-center h-14">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  if (evaluation === 'error') {
    return (
      <div className="mx-5 mb-4 rounded-2xl bg-gray-50 px-4 py-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-[18px] leading-none">✨</span>
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-bold text-gray-900">AI 평가 대기 중</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            오늘 할 일을 완료하면 피드백을 받을 수 있어요
          </p>
        </div>
      </div>
    )
  }

  const isDevil = evaluation.persona === 'DEVIL'
  const persona = isDevil ? 'DEVIL' : 'ANGEL'
  const isVoicePlaying = voice.isPlaying && voice.activePersona === persona

  return (
    <div
      className="mx-5 mb-4 rounded-2xl overflow-hidden"
      style={{
        background: isDevil ? 'linear-gradient(135deg, #1A0610 0%, #3A0A28 100%)' : '#F5F5F5',
      }}
    >
      <div className="flex items-center gap-3 px-4 pt-3 pb-2.5">
        <div className="shrink-0 animate-blob-float">
          {isDevil ? <DevilBlob size={48} /> : <AngelBlob size={48} />}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-[13px] font-black leading-tight ${isDevil ? 'text-white' : 'text-gray-900'}`}
          >
            {isDevil ? '악마 AI 👹' : '천사 AI 🌸'}
          </p>
          <p
            className={`text-[10px] font-semibold mt-0.5 ${isDevil ? 'text-[#FFAAC8]' : 'text-gray-400'}`}
          >
            {formatEvalDate(evaluation.date)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => voice.toggle({ persona, text: evaluation.message })}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 active:scale-90 shrink-0"
          style={{
            background: isVoicePlaying
              ? isDevil
                ? 'rgba(255,255,255,0.2)'
                : '#111'
              : isDevil
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(0,0,0,0.07)',
            color: isDevil ? 'white' : isVoicePlaying ? 'white' : '#111',
          }}
          aria-label={isVoicePlaying ? '정지' : '재생'}
        >
          {voice.isLoading && voice.activePersona === persona ? (
            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isVoicePlaying ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <rect x="1" y="1" width="3" height="8" rx="1" />
              <rect x="6" y="1" width="3" height="8" rx="1" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M2 1.5l7 3.5-7 3.5V1.5z" />
            </svg>
          )}
        </button>
      </div>
      <div className={`mx-4 h-px ${isDevil ? 'bg-white/10' : 'bg-gray-200'}`} />
      <div className="px-4 pt-2.5 pb-4">
        <p
          className={`text-[12px] leading-relaxed line-clamp-4 ${isDevil ? 'text-white/80' : 'text-gray-600'}`}
        >
          {evaluation.message}
        </p>
      </div>
    </div>
  )
}
