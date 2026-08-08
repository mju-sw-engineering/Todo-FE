export const metadata = {
  title: '이용약관 | 두비두비',
}

export default function TermsPage() {
  return (
    <div className="h-full overflow-y-auto max-w-2xl mx-auto px-5 py-12 text-ink bg-white">
      <h1 className="text-[22px] font-black mb-2">이용약관</h1>
      <p className="text-[13px] text-muted mb-10">시행일자: 2026년 8월 8일</p>

      <div className="space-y-8 text-[14px] leading-relaxed">
        <section>
          <h2 className="font-bold text-[16px] mb-2">제1조 (목적)</h2>
          <p>
            본 약관은 두비두비(이하 &lsquo;서비스&rsquo;)의 이용 조건 및 절차, 이용자와 서비스의
            권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-[16px] mb-2">제2조 (회원가입 및 계정)</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>이용자는 본 약관에 동의하고 정해진 절차에 따라 회원가입을 신청합니다.</li>
            <li>계정 정보(아이디, 비밀번호)의 관리 책임은 이용자 본인에게 있습니다.</li>
            <li>타인의 정보를 도용하여 가입한 경우 서비스 이용이 제한될 수 있습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-[16px] mb-2">제3조 (서비스의 제공)</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>서비스는 팀 기반 할일 관리, 팀 채팅, 활동 기록 등의 기능을 제공합니다.</li>
            <li>
              서비스는 운영상·기술상의 필요에 따라 제공 기능의 전부 또는 일부를 변경할 수 있으며,
              중요한 변경은 사전에 공지합니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-[16px] mb-2">제4조 (이용자의 의무)</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>타인의 권리를 침해하거나 법령에 위반되는 콘텐츠를 게시해서는 안 됩니다.</li>
            <li>서비스의 정상적인 운영을 방해하는 행위를 해서는 안 됩니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-[16px] mb-2">제5조 (계약 해지 및 탈퇴)</h2>
          <p>
            이용자는 언제든지 마이페이지의 회원 탈퇴 기능을 통해 이용 계약을 해지할 수 있으며, 탈퇴
            시 개인정보는 개인정보처리방침에 따라 처리됩니다.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-[16px] mb-2">제6조 (면책)</h2>
          <p>
            서비스는 천재지변, 시스템 장애 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지
            않습니다. 무료로 제공되는 서비스의 이용과 관련하여 관계 법령에 특별한 규정이 없는 한
            책임을 지지 않습니다.
          </p>
        </section>
      </div>
    </div>
  )
}
