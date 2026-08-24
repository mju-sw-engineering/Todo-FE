/**
 * 두비두비 로고 원본 (벌 마크).
 *
 * 벌은 새로 그리지 않는다 — 앱에서 이미 쓰는 `public/images/bee/bee-plain.svg`
 * (로그인 벌 캐릭터에서 생성된 기본 포즈)를 그대로 가져와 타일 위에 얹는다.
 * 벌 모양을 바꾸려면 로그인 벌 원본을 고치고 scripts/generate-home-bees.mjs 를 다시 돌릴 것.
 *
 * 로고 배치(타일 색·여백)를 바꾼 뒤에는 `npm run icons:generate` 로
 * public/icon.svg · favicon · iOS/Android 앱 아이콘·스플래시를 재생성해야 한다.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BEE_ASSET = join(ROOT, 'public/images/bee/bee-plain.svg')

/** bee-plain.svg 에서 그림 내용과 viewBox 를 뽑아온다 */
function loadBee() {
  const file = readFileSync(BEE_ASSET, 'utf8')
  const [, viewBox] = file.match(/viewBox="([^"]+)"/)
  const [, markup] = file.match(/<svg[^>]*>([\s\S]*)<\/svg>/)
  const [x, y, width, height] = viewBox.split(/\s+/).map(Number)

  return {
    box: { x, y, width, height },
    /* <title>/<desc> 는 로고 자체의 라벨과 겹치므로 제거 */
    markup: markup.replace(/<(title|desc)>[\s\S]*?<\/\1>/g, '').trim(),
  }
}

const BEE = loadBee()

/**
 * 벌을 지정한 정사각 영역 안에 여백을 두고 가운데 맞춰 배치한다.
 * @param {number} canvas 정사각 캔버스 한 변
 * @param {number} padding 캔버스 가장자리 여백
 */
function placeBee(canvas, padding) {
  const inner = canvas - padding * 2
  const scale = inner / Math.max(BEE.box.width, BEE.box.height)
  const offsetX = padding + (inner - BEE.box.width * scale) / 2
  const offsetY = padding + (inner - BEE.box.height * scale) / 2

  return `<g fill="none" transform="translate(${round(offsetX)} ${round(offsetY)}) scale(${round(scale, 5)}) translate(${-BEE.box.x} ${-BEE.box.y})">${BEE.markup}</g>`
}

function round(value, digits = 3) {
  return Number(value.toFixed(digits))
}

const DEFS = `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#8BC5FF"/>
      <stop offset=".55" stop-color="#7EB8F8"/>
      <stop offset="1" stop-color="#6FA8ED"/>
    </linearGradient>
    <radialGradient id="glow" cx=".36" cy=".28" r=".85">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".55"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
`

/**
 * @param {'rounded' | 'square' | 'circle' | 'none'} tile 배경 타일 모양
 *   rounded: 앱 내 마크·파비콘 / square: iOS(자체 마스킹) / circle: Android round / none: 배경 없음
 */
export function logoSvg(tile = 'rounded') {
  const bg = {
    rounded:
      '<rect width="120" height="120" rx="27" fill="url(#sky)"/><rect width="120" height="120" rx="27" fill="url(#glow)"/>',
    square:
      '<rect width="120" height="120" fill="url(#sky)"/><rect width="120" height="120" fill="url(#glow)"/>',
    circle:
      '<circle cx="60" cy="60" r="60" fill="url(#sky)"/><circle cx="60" cy="60" r="60" fill="url(#glow)"/>',
    none: '',
  }[tile]

  /* 원형 타일은 모서리가 없어 팔·다리가 잘리므로 여백을 더 준다 */
  const padding = tile === 'circle' ? 19 : 14

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="두비두비">${DEFS}${bg}${placeBee(120, padding)}</svg>`
}

/** Android 적응형 아이콘 배경 레이어 (108dp 캔버스 꽉 채운 하늘색) */
export function backgroundLayerSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="108" height="108">${DEFS}<rect width="108" height="108" fill="url(#sky)"/><rect width="108" height="108" fill="url(#glow)"/></svg>`
}

/**
 * Android 적응형 아이콘 전경 레이어.
 * 108dp 캔버스 가운데에 벌만 투명 배경으로 배치한다. 여백 27dp(=54dp 정사각)이라
 * 런처가 72dp 원으로 잘라도 다리·팔 끝이 안 잘린다.
 */
export function foregroundLayerSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="108" height="108">${placeBee(108, 27)}</svg>`
}
