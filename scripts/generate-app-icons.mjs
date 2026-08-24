/**
 * 로고 원본(scripts/logo-source.mjs)에서 앱 아이콘 에셋을 전부 생성한다.
 *
 *   node scripts/generate-app-icons.mjs
 *
 * 생성물: public/icon.svg, src/app/favicon.ico, iOS AppIcon/스플래시, Android mipmap 아이콘/스플래시
 */
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { backgroundLayerSvg, foregroundLayerSvg, logoSvg } from './logo-source.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const ANDROID_DENSITIES = [
  { dir: 'ldpi', legacy: 36, adaptive: 81 },
  { dir: 'mdpi', legacy: 48, adaptive: 108 },
  { dir: 'hdpi', legacy: 72, adaptive: 162 },
  { dir: 'xhdpi', legacy: 96, adaptive: 216 },
  { dir: 'xxhdpi', legacy: 144, adaptive: 324 },
  { dir: 'xxxhdpi', legacy: 192, adaptive: 432 },
]

const FAVICON_SIZES = [16, 32, 48, 64, 128, 256]

/** 스플래시 배경색 (라이트 / 다크) */
const SPLASH_BG = { light: '#ffffff', dark: '#171b26' }
/** 스플래시 로고는 짧은 변의 이 비율만큼 차지한다 */
const SPLASH_LOGO_RATIO = 0.3

function png(svg, size, { opaque = false } = {}) {
  let pipeline = sharp(Buffer.from(svg), { density: 512 }).resize(size, size)
  if (opaque) pipeline = pipeline.flatten({ background: '#7EB8F8' })
  return pipeline.png().toBuffer()
}

/** 배경색 위에 로고를 가운데 얹은 스플래시 이미지 */
async function splash(width, height, theme) {
  const logoSize = Math.round(Math.min(width, height) * SPLASH_LOGO_RATIO)
  const logo = await png(logoSvg('rounded'), logoSize)
  return sharp({
    create: { width, height, channels: 4, background: SPLASH_BG[theme] },
  })
    .composite([{ input: logo, gravity: 'centre' }])
    .png()
    .toBuffer()
}

function write(relPath, buffer) {
  const target = join(ROOT, relPath)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, buffer)
  console.log('  ✓', relPath)
}

/** PNG 버퍼들을 하나의 .ico 컨테이너로 묶는다 (Vista 이후 PNG 방식) */
function buildIco(entries) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(entries.length, 4)

  let offset = 6 + entries.length * 16
  const directory = entries.map(({ size, data }) => {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0) // width (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1) // height
    entry.writeUInt8(0, 2) // palette
    entry.writeUInt8(0, 3) // reserved
    entry.writeUInt16LE(1, 4) // color planes
    entry.writeUInt16LE(32, 6) // bits per pixel
    entry.writeUInt32LE(data.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += data.length
    return entry
  })

  return Buffer.concat([header, ...directory, ...entries.map((e) => e.data)])
}

const rounded = logoSvg('rounded')
const square = logoSvg('square')
const circle = logoSvg('circle')

console.log('웹')
write('public/icon.svg', Buffer.from(`${rounded}\n`))

const faviconEntries = await Promise.all(
  FAVICON_SIZES.map(async (size) => ({ size, data: await png(rounded, size) }))
)
write('src/app/favicon.ico', buildIco(faviconEntries))

console.log('iOS')
write(
  'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png',
  await png(square, 1024, { opaque: true })
)

const IOS_SPLASH_DIR = 'ios/App/App/Assets.xcassets/Splash.imageset'
for (const file of readdirSync(join(ROOT, IOS_SPLASH_DIR)).filter((f) => f.endsWith('.png'))) {
  const theme = file.includes('-dark') ? 'dark' : 'light'
  write(`${IOS_SPLASH_DIR}/${file}`, await splash(2732, 2732, theme))
}

console.log('Android')
const background = backgroundLayerSvg()
const foreground = foregroundLayerSvg()
for (const { dir, legacy, adaptive } of ANDROID_DENSITIES) {
  const base = `android/app/src/main/res/mipmap-${dir}`
  write(`${base}/ic_launcher.png`, await png(rounded, legacy))
  write(`${base}/ic_launcher_round.png`, await png(circle, legacy))
  write(`${base}/ic_launcher_background.png`, await png(background, adaptive, { opaque: true }))
  write(`${base}/ic_launcher_foreground.png`, await png(foreground, adaptive))
}

const ANDROID_RES = 'android/app/src/main/res'
for (const dir of readdirSync(join(ROOT, ANDROID_RES)).filter((d) => d.startsWith('drawable'))) {
  const files = readdirSync(join(ROOT, ANDROID_RES, dir))
  if (!files.includes('splash.png')) continue
  const relPath = `${ANDROID_RES}/${dir}/splash.png`
  const { width, height } = await sharp(join(ROOT, relPath)).metadata()
  write(relPath, await splash(width, height, dir.includes('night') ? 'dark' : 'light'))
}
