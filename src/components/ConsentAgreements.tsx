'use client'

import Link from 'next/link'

export interface ConsentState {
  termsAgreed: boolean
  privacyAgreed: boolean
  marketingAgreed: boolean
}

interface ConsentAgreementsProps {
  value: ConsentState
  onChange: (next: ConsentState) => void
}

/**
 * 가입 약관 동의 묶음.
 *
 * 이메일 가입과 애플 가입이 같은 동의 이력을 남겨야 하므로 두 화면이 공유한다.
 * 어느 쪽으로 가입하든 백엔드는 동일한 `user_consents` 레코드를 기록한다.
 */
export function ConsentAgreements({ value, onChange }: ConsentAgreementsProps) {
  const allAgreed = value.termsAgreed && value.privacyAgreed && value.marketingAgreed

  function handleAllAgreeChange(checked: boolean) {
    onChange({ termsAgreed: checked, privacyAgreed: checked, marketingAgreed: checked })
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border p-4">
      <label className="flex items-center gap-2.5 text-[14px] font-semibold text-gray-900">
        <input
          type="checkbox"
          className="w-4 h-4 accent-primary"
          checked={allAgreed}
          onChange={(e) => handleAllAgreeChange(e.target.checked)}
        />
        전체 동의
      </label>
      <div className="h-px bg-border" />
      <div className="flex items-center">
        <label className="flex-1 flex items-center gap-2.5 text-[13px] text-gray-700">
          <input
            type="checkbox"
            className="w-4 h-4 accent-primary"
            checked={value.termsAgreed}
            onChange={(e) => onChange({ ...value, termsAgreed: e.target.checked })}
          />
          (필수) 이용약관 동의
        </label>
        <Link
          href="/terms"
          target="_blank"
          className="text-[12px] text-muted underline underline-offset-2 hover:text-ink shrink-0"
        >
          보기
        </Link>
      </div>
      <div className="flex items-center">
        <label className="flex-1 flex items-center gap-2.5 text-[13px] text-gray-700">
          <input
            type="checkbox"
            className="w-4 h-4 accent-primary"
            checked={value.privacyAgreed}
            onChange={(e) => onChange({ ...value, privacyAgreed: e.target.checked })}
          />
          (필수) 개인정보 처리방침 동의
        </label>
        <Link
          href="/privacy"
          target="_blank"
          className="text-[12px] text-muted underline underline-offset-2 hover:text-ink shrink-0"
        >
          보기
        </Link>
      </div>
      <label className="flex items-center gap-2.5 text-[13px] text-gray-700">
        <input
          type="checkbox"
          className="w-4 h-4 accent-primary"
          checked={value.marketingAgreed}
          onChange={(e) => onChange({ ...value, marketingAgreed: e.target.checked })}
        />
        (선택) 마케팅 정보 수신 동의
      </label>
    </div>
  )
}
