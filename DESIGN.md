# Design

## Source of truth

- Status: Active
- Last refreshed: 2026-08-15
- Primary product surfaces: mobile-first team todo app, authentication, feed, teams, availability, chat
- Evidence reviewed: `CLAUDE.md`, `src/app/globals.css`, `src/components/ui/`, `src/app/(auth)/login/page.tsx`, bee assets under `public/images/bee/`

## Brand

- Personality: friendly, energetic, collaborative, and reassuring
- Trust signals: clear hierarchy, familiar controls, readable copy, restrained motion
- Avoid: generic corporate visuals, harsh contrast, excessive decoration, motion that competes with tasks

## Product goals

- Goals: help teams start, coordinate, and complete everyday tasks with low friction
- Non-goals: dense enterprise project-management workflows or decorative effects that slow core actions
- Success signals: users can understand the primary action immediately and complete common flows without hesitation

## Personas and jobs

- Primary personas: students and small teams coordinating shared plans and tasks
- User jobs: sign in, see the team state, plan work, communicate, and mark progress
- Key contexts of use: mobile web and Capacitor apps, often in short sessions

## Information architecture

- Primary navigation: feed and team-centered task surfaces
- Core routes/screens: login/signup, feed, team list/detail, todos, availability, chat, settings
- Content hierarchy: current task or action first, supporting status second, decoration last

## Design principles

- Keep the next action obvious and reachable.
- Use the bee mascot to add warmth without obscuring content.
- Tradeoffs: character-rich moments are welcome on entry and empty states; task screens prioritize information density and speed.

## Visual language

- Color: use `src/app/globals.css` theme tokens only; authentication scenery may use the semantic `sun`, `sun-glow`, `meadow`, and `meadow-dark` tokens.
- Typography: Pretendard for UI; Jua only for brand and character decoration.
- Spacing/layout rhythm: mobile-first, generous touch spacing, bottom-sheet composition for authentication.
- Shape/radius/elevation: soft rounded surfaces and restrained shadows consistent with shared UI components.
- Motion: smooth, low-amplitude, story-like mascot movement; decorative scenery uses slow parallax and must honor reduced motion.
- Imagery/iconography: the bee is the primary character; natural scenery stays soft, layered, and lower contrast.

## Components

- Existing components to reuse: `Button`, `Input`, `AppleLoginButton`, and other components in `src/components/ui/`.
- New/changed components: route-local `LoginBeeScene` owns the authentication intro and scenery.
- Variants and states: flying, surprised, blink, waving, and reduced-motion static greeting.
- Token/component ownership: shared palette and animation tokens live in `globals.css`; login-only composition stays under the login route.

## Accessibility

- Target standard: WCAG 2.1 AA for core controls and content.
- Keyboard/focus behavior: all login controls remain keyboard reachable with visible focus states.
- Contrast/readability: scenery stays behind content and does not lower text or input contrast.
- Screen-reader semantics: decorative scenery and mascot animation remain hidden from assistive technology.
- Reduced motion and sensory considerations: show a static greeting and disable continuous environmental movement when reduced motion is requested.

## Responsive behavior

- Supported breakpoints/devices: mobile web and Capacitor first, then wider browser layouts.
- Layout adaptations: preserve the login form and title as the dominant layers; crop scenery rather than shrinking controls.
- Touch/hover differences: primary behavior cannot depend on hover.

## Interaction states

- Loading: disable competing login actions and show explicit progress copy.
- Empty: keep guidance concise and character-led where useful.
- Error: show actionable, readable feedback near the relevant action.
- Success: transition directly to the destination without unnecessary delay.
- Disabled: preserve legibility and communicate non-interactivity.
- Offline/slow network: keep the page usable and surface connection failures through existing error patterns.

## Content voice

- Tone: warm, short, and encouraging.
- Terminology: use familiar Korean product language consistently.
- Microcopy rules: state what is happening and what the user can do next.

## Implementation constraints

- Framework/styling system: Next.js 16 App Router, TypeScript strict mode, Tailwind CSS v4, Framer Motion.
- Design-token constraints: no arbitrary component colors; introduce reusable theme tokens before using new colors.
- Performance constraints: use optimized local images and compositor-friendly transforms for animation.
- Compatibility constraints: support mobile Safari and Capacitor webviews.
- Test/screenshot expectations: lint and production build must pass; visually verify the login scene at mobile and desktop widths.

## Open questions

- [ ] Confirm whether the nature scenery should remain exclusive to login or become a reusable welcome-screen theme.
