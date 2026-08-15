// 로그인 벌 캐릭터 SVG → 인라인 TS 모듈 변환 스크립트
//
// 사용법: public/images/bee/login/login-bee-character.svg 를 수정한 뒤
//   node scripts/generate-login-bee-svg.mjs
// 를 실행하면 src/app/(auth)/login/components/loginBeeSvg.ts 가 재생성된다.
//
// 하는 일: XML 선언·<title>·<desc>·주석 제거(호버 툴팁 방지), 루트에 width="100%" 부여,
// 템플릿 리터럴로 감싸 export. 모양 수정은 항상 원본 SVG에서 하고 이 스크립트로 동기화할 것.
import { readFileSync, writeFileSync } from 'node:fs'

const SRC = 'public/images/bee/login/login-bee-character.svg'
const OUT = 'src/app/(auth)/login/components/loginBeeSvg.ts'

let svg = readFileSync(SRC, 'utf8')
svg = svg.replace(/^<\?xml[^>]*\?>\s*/, '')
svg = svg.replace(/\s*<title>[\s\S]*?<\/title>/g, '')
svg = svg.replace(/\s*<desc>[\s\S]*?<\/desc>/g, '')
svg = svg.replace(/\s*<!--[\s\S]*?-->/g, '')
svg = svg.replace('<svg ', '<svg width="100%" ')
svg = svg.trim()

if (svg.includes('`') || svg.includes('${')) {
  throw new Error('SVG에 백틱(`) 또는 ${ 가 있어 템플릿 리터럴로 감쌀 수 없습니다.')
}

const ts = `// 자동 생성 파일 — 직접 수정 금지. 원본: public/images/bee/login/login-bee-character.svg
// 재생성: node scripts/generate-login-bee-svg.mjs
// 날개·팔·눈·입은 id 기반 그룹이며, 부위별 애니메이션은 globals.css의 .login-bee 규칙이 담당한다.
export const LOGIN_BEE_SVG = \`${svg}\`
`
writeFileSync(OUT, ts)
console.log(`generated ${OUT} (${ts.length} bytes)`)
