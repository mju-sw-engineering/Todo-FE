import { BeePose } from '@/components/bee/BeePose'

/** 기록 탭 최상단 히어로 — 안내자 역할의 두비, 실제 수치는 담지 않는다 */
export function HeroCard() {
  return (
    <section
      className="mx-5 mt-4 rounded-[26px] overflow-hidden relative border border-white"
      style={{
        background: 'linear-gradient(155deg,#eaf1ff 0%,#cfe0ff 100%)',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/images/decor/gradient-background.gif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(155deg,rgba(234,241,255,0.6) 0%,rgba(207,224,255,0.55) 100%)',
        }}
        aria-hidden
      />
      <div className="relative px-5 pt-6 pb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[19px] font-black text-ink leading-snug">
            꾸준함이
            <br />
            우리의 성과가 돼요!
          </p>
          <p className="mt-1.5 text-[12.5px] text-muted">작은 한 걸음이 모여 큰 벌집이 됩니다.</p>
        </div>
        <BeePose pose="cheer" size={84} className="shrink-0" />
      </div>
    </section>
  )
}
