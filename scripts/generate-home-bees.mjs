// 홈 화면용 벌 일러스트 3종을 로그인 벌에서 생성한다.
//
// 사용법: node scripts/generate-home-bees.mjs
//
// 원본은 public/images/bee/login-bee-character.svg 한 장이고, 여기서 얼굴 파츠와
// 몸을 그대로 물려받는다. 그래서 로그인 벌을 고치면 이 스크립트만 다시 돌리면 되고,
// 세 일러스트가 "다른 벌"이 될 일이 없다.
//
// 각 일러스트는 나는 자세를 유지한 채 기울기·표정·소품만 다르다.
//   bee-cheer.svg   모두 완료 배너   32도 기울여 양팔 V + 웃는 눈 + 색종이
//   bee-search.svg  할 일 없음       12도 갸웃 + 돋보기(렌즈 속 커진 눈)
//   bee-flower.svg  제출 완료        꽃 한 송이를 쥠
//
// 소품을 든 손은 "주먹이 손잡이를 통째로 감싸고 손잡이가 위아래로 빠져나오는" 형태로 그린다.
// 손잡이를 손에 닿게만 두면 얹어놓은 것처럼 보이고, 길게 관통시키면 팔 위에 얹힌 막대로 보인다.
import { readFileSync, writeFileSync } from 'node:fs'

const SRC = 'public/images/bee/login-bee-character.svg'
const OUT_DIR = 'public/images/bee'

const HANDLE = '#E38B2F' // 소품 손잡이·테두리 (검은 팔과 대비되도록 코 색을 쓴다)
const LENS = '#EAF6FB'
const INK = '#000000'

/** 여는 태그가 중첩돼도 짝이 맞는 </g>까지 잘라낸다 */
function cutGroup(svg, id) {
  const start = svg.indexOf(`<g id="${id}"`)
  if (start === -1) return svg
  let depth = 0
  let i = start
  for (;;) {
    const open = svg.indexOf('<g', i + 1)
    const close = svg.indexOf('</g>', i + 1)
    if (close === -1) return svg
    if (open !== -1 && open < close) {
      depth += 1
      i = open
    } else {
      if (depth === 0) return svg.slice(0, start) + svg.slice(close + 4)
      depth -= 1
      i = close
    }
  }
}

/** 소품을 쥔 주먹 — 손잡이 위에 덮어 그려 손 전체가 감싸는 형태를 만든다 */
const grip = (cx, cy) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="50" ry="43" transform="rotate(-36 ${cx} ${cy})" fill="${INK}"/>`

const confetti = [
  [330, 210, 25, '#4B8BFF'],
  [880, 180, -30, '#FF6B68'],
  [280, 430, -15, '#6FBF73'],
  [960, 430, 20, '#FFC94D'],
  [520, 140, -40, '#FF6B68'],
  [760, 110, 35, '#4B8BFF'],
]
  .map(
    ([x, y, r, c]) =>
      `<rect x="${x}" y="${y}" width="26" height="13" rx="4" transform="rotate(${r} ${x + 13} ${y + 6})" fill="${c}"/>`
  )
  .concat(
    [
      [400, 300, '#FFC94D'],
      [930, 320, '#4B8BFF'],
      [620, 130, '#FF6B68'],
      [300, 560, '#6FBF73'],
    ].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="11" fill="${c}"/>`)
  )
  .join('\n    ')

const magnifier = `<path d="M940 531 L1044 653" stroke="${HANDLE}" stroke-width="30" stroke-linecap="round"/>
    ${grip(998, 599)}
    <circle cx="872" cy="452" r="104" fill="${LENS}"/>
    <ellipse cx="878" cy="456" rx="61" ry="77" fill="#FFFFFF"/>
    <ellipse cx="884" cy="466" rx="41" ry="54" fill="${INK}"/>
    <circle cx="864" cy="428" r="16" fill="#FFFFFF"/>
    <path d="M820 496 A89 89 0 0 1 828 400" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round" fill="none" opacity=".7"/>
    <circle cx="872" cy="452" r="104" fill="none" stroke="${HANDLE}" stroke-width="26"/>`

const petals = [
  [1066, 372],
  [1121, 412],
  [1100, 477],
  [1032, 477],
  [1011, 412],
]
  .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="40" fill="#FF8FA0"/>`)
  .join('\n    ')

const flower = `<path d="M1028 668 Q1000 604 1016 536 Q1032 476 1060 446" stroke="#4C9A55" stroke-width="20" stroke-linecap="round" fill="none"/>
    <path d="M1016 520 Q978 502 966 470 Q1004 466 1022 500 Z" fill="#6FBF73"/>
    ${grip(1006, 604)}
    ${petals}
    <circle cx="1066" cy="430" r="34" fill="#FFC94D"/>`

const cheerFace = `<path d="M545 552 Q588 498 631 550" stroke="${INK}" stroke-width="20" stroke-linecap="round" fill="none"/>
    <path d="M765 566 Q806 512 848 564" stroke="${INK}" stroke-width="20" stroke-linecap="round" fill="none"/>
    <path d="M628 626 Q690 616 752 630 Q748 706 690 710 Q634 706 628 626 Z" fill="#74140F"/>
    <path d="M652 678 Q690 664 728 680 Q718 706 690 708 Q662 704 652 678 Z" fill="#F75B57"/>`

const POSES = [
  {
    file: 'bee-cheer.svg',
    title: '두비두비 꿀벌 — 모두 완료',
    desc: '할 일을 모두 끝냈을 때 쓰는 환호 일러스트',
    tilt: -32,
    viewBox: '128 122 878 983',
    // 웃는 눈·크게 웃는 입으로 갈아끼우므로 기본 눈·입은 들어낸다
    drop: ['eye-left', 'eye-right', 'mouth-open'],
    overlay: `${cheerFace}\n    ${confetti}`,
  },
  {
    file: 'bee-search.svg',
    title: '두비두비 꿀벌 — 할 일 없음',
    desc: '할 일이 하나도 없는 빈 상태에서 쓰는 살펴보는 일러스트',
    tilt: -12,
    viewBox: '150 158 940 888',
    drop: [],
    overlay: magnifier,
  },
  {
    file: 'bee-flower.svg',
    title: '두비두비 꿀벌 — 제출 완료',
    desc: '할 일을 제출했을 때 쓰는 꽃 든 일러스트',
    tilt: -4,
    viewBox: '172 180 1004 806',
    drop: [],
    overlay: flower,
  },
]

// 세 일러스트에서 공통으로 쓰지 않는 파츠 (로그인 씬 전용 표정·액세서리)
const UNUSED = ['eyelids', 'mouth-surprised', 'acc-ribbon', 'acc-sprout', 'arm-left-rest']

const source = readFileSync(SRC, 'utf8')

for (const pose of POSES) {
  let svg = source

  // 주석·제목을 이 일러스트의 것으로 갈아끼운다
  svg = svg.replace(/<!--[\s\S]*?-->\n?/, '')
  svg = svg.replace(/<title>[\s\S]*?<\/title>/, `<title>${pose.title}</title>`)
  svg = svg.replace(/<desc>[\s\S]*?<\/desc>/, `<desc>${pose.desc}</desc>`)

  for (const id of [...UNUSED, ...pose.drop]) svg = cutGroup(svg, id)

  svg = svg.replace(/viewBox="[^"]*"/, `viewBox="${pose.viewBox}"`)
  svg = svg.replace(
    '<g id="bee-character"',
    `<g id="bee-character" transform="rotate(${pose.tilt} 650 620)"`
  )

  // 소품·표정은 맨 위 레이어로 올린다
  const end = svg.lastIndexOf('</g>\n</svg>')
  svg = `${svg.slice(0, end)}    ${pose.overlay}\n  ${svg.slice(end)}`

  // 한 화면에 여러 장이 인라인될 때를 대비해 id를 파일별로 구분한다
  const prefix = pose.file.replace('.svg', '').replace('bee-', '')
  svg = svg.replace(/id="([^"]+)"/g, `id="${prefix}-$1"`)

  const header = `<?xml version="1.0" encoding="UTF-8"?>\n<!--\n  ${pose.title}\n\n  자동 생성 파일 — 직접 수정하지 말고 scripts/generate-home-bees.mjs 를 고쳐 다시 생성할 것.\n  원본 캐릭터: public/images/bee/login-bee-character.svg\n-->\n`
  svg = header + svg.replace(/^<\?xml[^>]*\?>\n?/, '')

  writeFileSync(`${OUT_DIR}/${pose.file}`, svg)
  console.log(`generated ${OUT_DIR}/${pose.file} (${svg.length} bytes)`)
}
