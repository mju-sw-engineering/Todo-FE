import type { CapacitorConfig } from '@capacitor/cli'

/**
 * 웹뷰가 로드할 주소.
 *
 * 이 앱은 웹 자산을 번들에 넣지 않고 배포된 웹을 그대로 띄운다. 그래서 기본값을 두면
 * 로컬에서 코드를 고쳐도 앱은 계속 운영 화면을 보여준다. 네이티브 기능(애플 로그인 등)을
 * 개발할 때는 `CAP_SERVER_URL`로 로컬 dev 서버를 가리켜야 한다.
 *
 *   시뮬레이터: CAP_SERVER_URL=http://localhost:3000 npx cap sync ios
 *   실기기:     CAP_SERVER_URL=http://<맥의 LAN IP>:3000 npx cap sync ios
 *              (같은 Wi-Fi + `npm run dev -- -H 0.0.0.0`)
 *
 * 이 값은 `npx cap sync`가 만드는 ios/App/App/capacitor.config.json에 구워지므로
 * 주소를 바꿀 때마다 sync를 다시 돌려야 한다. 그 파일은 gitignore돼 있어 커밋되지 않는다.
 */
const serverUrl = process.env.CAP_SERVER_URL ?? 'https://todo.bluerack.org/'

// 로컬 dev 서버는 평문 http라 ATS 예외가 필요하다. 운영 https에는 절대 붙이지 않는다.
const isCleartext = serverUrl.startsWith('http://')

const config: CapacitorConfig = {
  appId: 'org.bluerack.todo',
  appName: '두비두비',
  webDir: 'public',
  server: {
    url: serverUrl,
    ...(isCleartext ? { cleartext: true } : {}),
  },
}

export default config
