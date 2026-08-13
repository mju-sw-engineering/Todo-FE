<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Todo-FE 에이전트 규칙

이 저장소의 모든 컨벤션은 **[CLAUDE.md](./CLAUDE.md)** 를 단일 기준으로 따른다. 작업 전에 반드시 읽을 것.

그중 가장 자주 어겨지는 필수 규칙 요약:

1. **디자인 시스템을 벗어난 임의 디자인 금지.** UI를 만들 때 `src/components/ui/`의 공용 컴포넌트(Button, Input, ConfirmModal, Toast 등)를 먼저 사용하고, 색상은 `src/app/globals.css`의 `@theme` 토큰(`primary`, `surface`, `ink`, `neutral-*` 등)만 쓴다. 임의 hex 값이나 Tailwind 기본 팔레트로 새 색을 도입하지 않는다. 폰트는 기본 Pretendard 고정이며 새 폰트를 추가하지 않는다 (브랜드 장식 텍스트의 `font-jua`만 예외).
2. 페이지 전용 컴포넌트는 해당 라우트의 `components/`에, 재사용 컴포넌트만 `src/components/`에 둔다.
3. 컴포넌트는 named export, props는 파일 내 `interface`, `any` 금지.
4. API 호출은 `src/services/` 경유, 서버 상태는 React Query 훅으로 감싼다.
5. 커밋은 Conventional Commits (`feat(todo): ...`) 형식.
