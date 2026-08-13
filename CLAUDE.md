# Todo-FE 프로젝트 컨벤션

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (`@theme` 토큰 기반 디자인 시스템)
- **서버 상태**: TanStack React Query v5
- **전역 상태**: React Context (`src/store/authStore.tsx`)
- **애니메이션**: framer-motion + globals.css의 `--animate-*` 토큰
- **네이티브 앱**: Capacitor 8 (iOS / Android 래핑)
- **실시간 채팅**: STOMP (@stomp/stompjs) + SockJS
- **아이콘**: react-icons
- **Linting**: ESLint + Prettier, Husky + lint-staged

## 개발 명령어

```bash
npm run dev             # 개발 서버 실행
npm run build           # 프로덕션 빌드
npm run lint            # ESLint 검사
npm run lint:fix        # ESLint 자동 수정
npm run format          # Prettier 포맷팅
npm run cap:sync        # 웹 빌드를 iOS/Android 프로젝트에 동기화
npm run cap:open:ios    # Xcode로 iOS 프로젝트 열기
npm run cap:open:android # Android Studio로 프로젝트 열기
```

## 디자인 시스템 (필수 준수)

**새 UI를 만들 때 임의로 디자인하지 않는다.** 이 프로젝트는 자체 디자인 시스템을 갖고 있고, 모든 화면은 여기에 맞춰야 한다.

### 1. 공용 컴포넌트를 먼저 사용한다

버튼, 인풋, 모달 등 UI가 필요하면 **`src/components/ui/`의 기존 컴포넌트를 먼저 찾아 사용**한다. `<button>`, `<input>` 등을 직접 스타일링해서 새로 만들지 않는다.

주요 공용 컴포넌트:

| 컴포넌트                                       | 용도                                                    |
| ---------------------------------------------- | ------------------------------------------------------- |
| `Button`                                       | 모든 버튼 (`variant`: primary/secondary/danger/outline) |
| `Input`, `Textarea`                            | 텍스트 입력                                             |
| `ConfirmModal`                                 | 확인/취소 모달                                          |
| `Toast`                                        | 토스트 알림                                             |
| `Spinner`, `PageLoader`                        | 로딩 표시                                               |
| `Calendar`                                     | 날짜 선택                                               |
| `MemberAvatar`, `TeamAvatar`, `BlobAvatar`     | 아바타                                                  |
| `TodoStatusBadge`                              | 할일 상태 뱃지                                          |
| `BackButton`, `ConvexCard`, `ReactionEmoji` 등 | 그 외 `src/components/ui/` 참고                         |

- 필요한 변형이 없으면 **기존 컴포넌트에 variant/prop을 추가**하는 것을 우선 검토하고, 완전히 새로운 컴포넌트 생성은 최후의 수단으로 한다.
- 새 공용 컴포넌트를 만들 때도 기존 컴포넌트의 스타일 언어(둥근 모서리 `rounded-[14px]` 계열, transition 패턴, disabled 처리 등)를 그대로 따른다.

### 2. 색상은 디자인 토큰만 사용한다

색상은 `src/app/globals.css`의 `@theme` 토큰만 사용한다. **임의의 hex 값(`bg-[#4b8bff]` 등)이나 Tailwind 기본 팔레트(`bg-blue-500` 등)로 새 색을 도입하지 않는다.**

- 시맨틱 토큰 우선: `primary`, `primary-hover`, `primary-light`, `surface`, `border`, `ink`, `muted`
- 필요 시 팔레트 토큰: `primary-50/55`, `secondary-50/10`, `neutral-20~120`, `coolGray-20/50/80`, `status-red`, `static-black/white`
- 새 색이 정말 필요하면 코드에 하드코딩하지 말고 `@theme`에 토큰으로 추가한 뒤 사용한다.

### 3. 폰트는 Pretendard로 고정한다

- 기본 서체는 **Pretendard** (`src/fonts/PretendardVariable.woff2`, `--font-sans`로 body에 이미 적용됨). 별도 `font-family` 지정 없이 그대로 상속받아 쓴다.
- 예외는 **Jua(`font-jua`) 하나뿐**이며, 로고·캐릭터 말풍선 같은 브랜드 장식 텍스트에만 쓴다. 일반 본문/버튼/입력에는 쓰지 않는다.
- **새 폰트를 추가하거나 다른 서체를 지정하지 않는다.** (Google Fonts 추가, `font-family` 인라인 지정 금지)

### 4. 애니메이션도 토큰을 우선 사용한다

`animate-fade-up`, `animate-emoji-pop`, `animate-blob-float`, `animate-shimmer`, `animate-fall-in` 등 globals.css에 정의된 애니메이션을 우선 사용하고, 복잡한 인터랙션만 framer-motion을 쓴다.

## 폴더 구조

```
src/
├── app/                      # Next.js App Router (페이지, 레이아웃)
│   ├── globals.css           # 글로벌 스타일 + @theme 디자인 토큰
│   ├── providers.tsx         # QueryClient, Auth 등 전역 Provider
│   └── (route)/
│       ├── components/       # 이 라우트(페이지)에서만 쓰이는 컴포넌트
│       └── page.tsx
├── components/               # 2곳 이상에서 재사용되는 공용 컴포넌트
│   └── ui/                   # 아토믹 단위 (Button, Input 등) — 역할 기반 공용, 호출처가 1곳이어도 여기 유지
├── hooks/                    # 커스텀 React 훅
├── lib/                      # 유틸리티 함수, 헬퍼 (apiClient, dateUtils 등)
├── services/                 # API 호출 함수
├── store/                    # 전역 상태 (React Context)
└── types/                    # TypeScript 타입 정의 (도메인별 *.types.ts)
```

**컴포넌트 배치 기준**: 특정 페이지(라우트)에서만 쓰이는 컴포넌트는 해당 라우트 폴더 아래 `components/`에 둔다. 2곳 이상의 페이지에서 재사용되거나 `Button`/`Input`처럼 디자인 시스템 아토믹 단위 컴포넌트라면 `src/components/`(또는 `src/components/ui/`)로 뺀다. 새 컴포넌트를 만들 때 "이게 다른 페이지에서도 쓰일까?"를 먼저 판단하고, 아니라면 페이지 폴더 안에 두는 것이 기본값이다.

## 경로 alias

`@/*` → `src/*` 로 매핑됩니다. 단, 페이지 전용 `components/` 폴더를 그 페이지(또는 하위 페이지)에서 import할 때는 상대 경로(`./components/X`)를 사용해 페이지-로컬 컴포넌트임을 명확히 드러낸다. `src/hooks`, `src/lib` 등 다른 트리에서 페이지-로컬 컴포넌트를 참조해야 하는 예외적인 경우에만 `@/app/...` alias를 쓴다.

```ts
import { Button } from '@/components/ui/Button'
import { useTodos } from '@/hooks/useTodos'
import { fetchTodos } from '@/services/todoService'
import { TeamMembersCard } from './components/TeamMembersCard' // 같은 라우트 폴더의 페이지 전용 컴포넌트
```

## 네이밍 컨벤션

| 대상             | 규칙                          | 예시             |
| ---------------- | ----------------------------- | ---------------- |
| 컴포넌트 파일    | PascalCase                    | `TodoItem.tsx`   |
| 훅 파일          | camelCase, `use` 접두사       | `useTodos.ts`    |
| 유틸/서비스 파일 | camelCase                     | `todoService.ts` |
| 타입 파일        | camelCase, `.types.ts` 접미사 | `todo.types.ts`  |
| 상수             | UPPER_SNAKE_CASE              | `MAX_TODO_COUNT` |
| CSS 클래스       | Tailwind 유틸리티 클래스 우선 |                  |

## 컴포넌트 작성 규칙

- 컴포넌트는 **named export** 사용 (default export 지양)
- props 타입은 컴포넌트 파일 내 `interface` 로 정의
- Server Component가 기본, 클라이언트 상태/이벤트가 필요한 경우만 `'use client'`

```tsx
// 좋은 예
interface TodoItemProps {
  id: string
  title: string
  completed: boolean
}

export function TodoItem({ id, title, completed }: TodoItemProps) {
  return <div>{title}</div>
}
```

## 데이터 & API 규칙

- API 호출은 컴포넌트에서 직접 fetch하지 않고 `src/services/`의 서비스 함수를 통한다 (내부적으로 `src/lib/apiClient.ts` 사용)
- 서버 데이터 fetching/mutation은 React Query 훅으로 감싼다 (`src/hooks/` 참고)
- 도메인별 타입은 `src/types/<도메인>.types.ts`에 정의하고 서비스/훅에서 공유한다

## TypeScript 규칙

- `any` 사용 금지 — `unknown` 또는 명시적 타입 사용
- 타입과 인터페이스: 객체 형태는 `interface`, 유니온/유틸리티 타입은 `type`
- 타입은 `src/types/` 에 모아두되, 컴포넌트 전용 타입은 해당 파일 내 정의

## 스타일 규칙

- Tailwind 유틸리티 클래스를 우선 사용하고, 색상·애니메이션은 위 디자인 시스템 토큰을 따른다
- 조건부 클래스 조합은 배열 + `filter(Boolean).join(' ')` 패턴 사용 (`src/components/ui/Button.tsx` 참고)
- 인라인 `style` 속성은 런타임에 계산되는 동적 값(좌표, 퍼센트, 사용자 지정 색 등)에만 허용 — 정적 스타일은 Tailwind로 작성

## Git 커밋 컨벤션

Conventional Commits 형식을 따릅니다.

```
<type>(<scope>): <subject>
```

| type       | 의미                      |
| ---------- | ------------------------- |
| `feat`     | 새로운 기능               |
| `fix`      | 버그 수정                 |
| `refactor` | 리팩토링 (기능 변경 없음) |
| `style`    | 코드 포맷, 세미콜론 등    |
| `chore`    | 빌드, 패키지 설정 변경    |
| `docs`     | 문서 변경                 |
| `test`     | 테스트 추가/수정          |

예시:

```
feat(todo): 할일 추가 기능 구현
fix(auth): 로그인 토큰 만료 처리 수정
chore: prettier 설정 추가
```

## 코드 품질

- pre-commit 훅에서 lint-staged 실행 (ESLint + Prettier 자동 적용)
- `console.log` 는 개발 중 임시 사용만 허용, 커밋 전 제거
- 함수/변수명은 동작/역할을 명확히 나타내는 영어로 작성
