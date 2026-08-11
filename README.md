This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 환경 변수 (`.env`)

배포된 API를 그대로 쓰면서 로컬 개발하려면 **프록시를 켜야 합니다.**

```bash
NEXT_PUBLIC_API_URL=https://api.todo.bluerack.org
NEXT_PUBLIC_USE_API_PROXY=true
```

플래그를 켜면 브라우저가 같은 오리진(`localhost:3000`)으로 REST 요청을 보내고 Next 서버가
`NEXT_PUBLIC_API_URL`로 전달합니다. **`NEXT_PUBLIC_API_URL`은 절대 URL로 유지해야 합니다** —
WebSocket(SockJS)은 쿠키가 필요 없고 Next rewrite가 업그레이드를 프록시하지 못해 이 값으로
직접 연결하기 때문입니다. 비우면 알림·채팅이 `/ws/info` 404로 계속 재연결을 시도합니다.

**직접 호출하면 로그인은 되지만 토큰 갱신이 실패합니다.** 리프레시 토큰 쿠키가 `SameSite=Strict`라
`localhost`에서 `bluerack.org`로 가는 크로스 사이트 요청에는 브라우저가 쿠키를 싣지 않기 때문입니다.
액세스 토큰 수명이 1시간이라 그 뒤로 계속 로그아웃됩니다.

운영은 `todo.bluerack.org`와 `api.todo.bluerack.org`가 같은 사이트라 프록시 없이 동작하며,
플래그가 없으면 rewrite가 등록되지 않으므로 운영 빌드는 영향받지 않습니다.

백엔드를 직접 띄우는 경우에는 프록시 없이 아래만 있으면 됩니다.

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 실행

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### iOS 앱에서 개발하기 (Capacitor)

이 앱은 웹 자산을 번들에 넣지 않고 `capacitor.config.ts`의 `server.url`이 가리키는 웹을
그대로 웹뷰에 띄웁니다. 기본값이 배포 주소라, **그냥 Xcode로 실행하면 로컬 수정이 반영되지
않고 운영 화면이 뜹니다.** 애플 로그인처럼 네이티브 기능을 건드릴 때는 `CAP_SERVER_URL`로
로컬 dev 서버를 가리켜야 합니다.

```bash
npm run dev
CAP_SERVER_URL=http://localhost:3000 npx cap sync ios   # 시뮬레이터
```

**실기기는 평문 http dev 서버에 붙일 수 없습니다.** 두 가지가 동시에 막습니다.

- iOS ATS가 평문을 차단합니다. `capacitor.config.ts`의 `cleartext`는 **Android 전용**이라
  iOS에는 아무 효과가 없고, iOS 17+는 `NSAllowsLocalNetworking`으로도 IP 주소 접속을
  허용하지 않습니다. 시뮬레이터에서 `localhost`가 되는 건 ATS가 루프백을 예외로 두기 때문입니다.
- 애플 로그인은 nonce 해싱에 `crypto.subtle`이 필요한데, 이건 보안 컨텍스트(https 또는
  localhost)에서만 존재합니다.

실기기에서 확인해야 하면 https 터널을 쓰거나 배포본으로 테스트하세요.

- 주소는 `npx cap sync`가 만드는 `ios/App/App/capacitor.config.json`에 구워지므로 바꿀 때마다
  sync를 다시 돌려야 합니다. 이 파일은 gitignore돼 있어 커밋되지 않습니다.
- 운영 주소로 되돌리려면 환경 변수 없이 `npx cap sync ios`만 실행하면 됩니다.
- **이 상태에서는 `NEXT_PUBLIC_USE_API_PROXY=true`가 필요합니다.** 웹뷰 오리진이
  `localhost:3000`이 되어 위에 적은 `SameSite=Strict` 리프레시 쿠키 문제가 그대로 재현됩니다.
- 네이티브 플러그인을 새로 추가하면 웹만 배포해서는 동작하지 않습니다. `npx cap sync ios`
  후 Xcode 재빌드와 앱 재배포가 필요합니다.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Container CI/CD

Pull requests targeting `main` run `npm ci`, lint, and the production Next.js
build. A push to `main` builds a standalone production image and publishes both
of these tags:

- `ghcr.io/mju-sw-engineering/todo-fe:latest`
- `ghcr.io/mju-sw-engineering/todo-fe:<commit-sha>`

After the image is published, GitHub Actions calls the Coolify deploy webhook.
The image listens on port `3000` and runs as the non-root `node` user.

### GitHub configuration

Create this Actions repository variable:

- `NEXT_PUBLIC_API_URL`: public production API origin used by browser code

Create these Actions repository secrets:

- `COOLIFY_FE_WEBHOOK_URL`: deploy webhook of the image-based Coolify resource
- `COOLIFY_API_TOKEN`: Coolify API token with deploy permission

`NEXT_PUBLIC_API_URL` is compiled into the browser bundle during `next build`.
Changing it requires publishing a new image. Server-only secrets such as
`ELEVENLABS_API_KEY` must not be passed as Docker build arguments.

### Coolify migration

1. Create a Docker image resource using
   `ghcr.io/mju-sw-engineering/todo-fe:latest`.
2. Configure the container port as `3000` and add `ELEVENLABS_API_KEY` as a
   runtime environment variable.
3. If the GHCR package is private, configure registry credentials with package
   read permission.
4. Copy the new resource's deploy webhook into `COOLIFY_FE_WEBHOOK_URL`.
5. Deploy and verify the image resource before moving `todo.bluerack.org` to it.
6. After the new resource is healthy, disable the previous Git-source Auto
   Deploy and remove the old GitHub push webhook to prevent duplicate deploys.

For the first rollout, the image publish step completes before the workflow
checks the Coolify secrets. If the image resource and its webhook do not exist
yet, the final deploy step can fail while still leaving the initial GHCR image
available. Configure the resource and secrets, then rerun the workflow.
