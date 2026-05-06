# Todo-FE 프로젝트 컨벤션

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Linting**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged

## 개발 명령어

```bash
npm run dev        # 개발 서버 실행
npm run build      # 프로덕션 빌드
npm run lint       # ESLint 검사
npm run lint:fix   # ESLint 자동 수정
npm run format     # Prettier 포맷팅
```

## 폴더 구조

```
src/
├── app/              # Next.js App Router (페이지, 레이아웃, API route)
├── components/       # 재사용 가능한 UI 컴포넌트
│   └── ui/           # 기본 UI 컴포넌트 (Button, Input 등 아토믹 단위)
├── hooks/            # 커스텀 React 훅
├── lib/              # 유틸리티 함수, 헬퍼
├── services/         # API 호출 함수
├── store/            # 전역 상태 관리
├── styles/           # 글로벌 스타일
└── types/            # TypeScript 타입 정의
```

## 경로 alias

`@/*` → `src/*` 로 매핑됩니다.

```ts
import { Button } from '@/components/ui/Button'
import { useTodos } from '@/hooks/useTodos'
import { fetchTodos } from '@/services/todoService'
```

## 네이밍 컨벤션

| 대상             | 규칙                          | 예시             |
| ---------------- | ----------------------------- | ---------------- |
| 컴포넌트 파일    | PascalCase                    | `TodoItem.tsx`   |
| 훅 파일          | camelCase, `use` 접두사       | `useTodos.ts`    |
| 유틸/서비스 파일 | camelCase                     | `todoService.ts` |
| 타입 파일        | camelCase                     | `todo.types.ts`  |
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

## TypeScript 규칙

- `any` 사용 금지 — `unknown` 또는 명시적 타입 사용
- 타입과 인터페이스: 객체 형태는 `interface`, 유니온/유틸리티 타입은 `type`
- 타입은 `src/types/` 에 모아두되, 컴포넌트 전용 타입은 해당 파일 내 정의

## 스타일 규칙

- Tailwind 유틸리티 클래스를 우선 사용
- 복잡한 스타일 조합은 `cn()` 유틸 (clsx + tailwind-merge) 활용
- 인라인 `style` 속성 사용 지양

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
