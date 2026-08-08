import { BEE_INLINE, type InlineBeeExpression } from './beeInline'

interface AnimatedBeeProps {
  expression: InlineBeeExpression
  /** 같은 화면에 여러 마리 렌더 시 SVG id 충돌을 막는 인스턴스 접두사 (예: "b1") */
  ns: string
  className?: string
}

/**
 * 날개가 퍼덕이는 인라인 SVG 벌. 정적 자리에는 BeeCharacter(<img>)를 쓰고,
 * 날개 애니메이션이 필요한 곳(로그인 등)에만 이 컴포넌트를 쓴다.
 */
export function AnimatedBee({ expression, ns, className = '' }: AnimatedBeeProps) {
  const html = BEE_INLINE[expression].replaceAll('__NS__', ns)
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
