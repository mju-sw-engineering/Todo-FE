'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

interface ConvexCardProps {
  children: ReactNode
  bg: string
  className?: string
  onClick?: () => void
}

let _uid = 0

/**
 * 카드 크기에 맞는 볼록 렌즈 변위 맵 생성.
 * 각 픽셀의 R/G 채널이 x/y 굴절 방향을 인코딩.
 * R=128 / G=128 → 중립(이동 없음), 128에서 멀어질수록 외부로 굴절.
 */
function buildLensMap(w: number, h: number, bevel = 14): string {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  const img = ctx.createImageData(w, h)
  const px = img.data

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dL = x
      const dR = w - 1 - x
      const dT = y
      const dB = h - 1 - y

      // 각 테두리의 영향력: 테두리에서 0→1 sin 커브
      const eL = dL < bevel ? Math.sin(((bevel - dL) / bevel) * (Math.PI / 2)) : 0
      const eR = dR < bevel ? Math.sin(((bevel - dR) / bevel) * (Math.PI / 2)) : 0
      const eT = dT < bevel ? Math.sin(((bevel - dT) / bevel) * (Math.PI / 2)) : 0
      const eB = dB < bevel ? Math.sin(((bevel - dB) / bevel) * (Math.PI / 2)) : 0

      // 볼록: 중심에서 바깥 방향으로 굴절
      let nx = eR - eL
      let ny = eB - eT
      const m = Math.sqrt(nx * nx + ny * ny)
      if (m > 1) {
        nx /= m
        ny /= m
      }

      const i = (y * w + x) * 4
      px[i] = Math.round(128 + nx * 127) // R: x 방향
      px[i + 1] = Math.round(128 + ny * 127) // G: y 방향
      px[i + 2] = 128
      px[i + 3] = 255
    }
  }

  ctx.putImageData(img, 0, 0)
  return canvas.toDataURL()
}

export function ConvexCard({ children, bg, className = '', onClick }: ConvexCardProps) {
  const [filterId] = useState(() => `lg-${++_uid}`)
  const [mapUrl, setMapUrl] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    if (width > 0 && height > 0) {
      setMapUrl(buildLensMap(Math.round(width), Math.round(height)))
    }
  }, [])

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`relative w-full rounded-[22px] overflow-hidden transition-all duration-150 ${className}`}
      style={{
        isolation: 'isolate',
        background: 'rgba(255,255,255,0.52)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        boxShadow: [
          '0 16px 48px rgba(0,0,0,0.12)',
          '0 4px 14px rgba(0,0,0,0.07)',
          '0 0 0 0.5px rgba(255,255,255,0.55)',
        ].join(', '),
      }}
    >
      {/* 캔버스 렌즈 맵 → SVG feDisplacementMap 필터 */}
      {mapUrl && (
        <svg
          style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
          aria-hidden="true"
        >
          <defs>
            <filter
              id={filterId}
              x="-5%"
              y="-5%"
              width="110%"
              height="110%"
              colorInterpolationFilters="sRGB"
            >
              <feImage
                href={mapUrl}
                x="0"
                y="0"
                width="100%"
                height="100%"
                result="lens"
                preserveAspectRatio="none"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="lens"
                scale="25"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}

      {/* 팔레트 컬러 유리 틴트 (22% 불투명도) */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: bg, opacity: 0.22 }}
      />

      {/* 굴절 격자 텍스처: 렌즈 맵이 이 패턴을 일렁여 굴절 가시화 */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: [
            'repeating-linear-gradient(0deg, transparent 0, transparent 23px, rgba(255,255,255,0.07) 23px, rgba(255,255,255,0.07) 24px)',
            'repeating-linear-gradient(90deg, transparent 0, transparent 23px, rgba(255,255,255,0.07) 23px, rgba(255,255,255,0.07) 24px)',
          ].join(', '),
          filter: mapUrl ? `url(#${filterId})` : 'none',
        }}
      />

      {/* 볼록 유리 하이라이트: screen blend 로 상단을 자연스럽게 밝힘 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          mixBlendMode: 'screen',
          background: [
            'linear-gradient(155deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.55) 14%, rgba(255,255,255,0.12) 34%, transparent 52%)',
            'linear-gradient(90deg, rgba(255,255,255,0.22) 0%, transparent 20%)',
          ].join(', '),
        }}
      />

      {/* 테두리 shimmer: 얇은 흰색 림 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: [
            'inset 0 1.5px 0 rgba(255,255,255,1.00)',
            'inset 0 2px 14px -7px rgba(255,255,255,0.95)',
            'inset 1.5px 0 0 rgba(255,255,255,0.78)',
            'inset -1px 0 0 rgba(255,255,255,0.42)',
            'inset 0 -1px 0 rgba(255,255,255,0.32)',
          ].join(', '),
        }}
      />

      <div className="relative px-5 py-5 flex flex-col gap-3">{children}</div>
    </div>
  )
}
