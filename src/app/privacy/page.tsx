export const metadata = {
  title: '개인정보처리방침 | 두비두비',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="h-full overflow-y-auto max-w-2xl mx-auto px-5 py-12 text-ink bg-white">
      <h1 className="text-[22px] font-black mb-2">개인정보처리방침</h1>
      <p className="text-[13px] text-muted mb-10">시행일자: 2026년 7월 19일</p>

      <div className="space-y-8 text-[14px] leading-relaxed">
        <section>
          <p>
            두비두비(이하 &lsquo;서비스&rsquo;)은 이용자의 개인정보를 소중히 다루며, 관련 법령을
            준수합니다. 본 방침은 서비스가 어떤 개인정보를 수집하고, 어떻게 이용·보관·파기하는지
            안내합니다.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-[16px] mb-2">1. 수집하는 개인정보 항목</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>회원가입 시: 아이디, 비밀번호, 닉네임, 프로필 이미지(선택)</li>
            <li>
              서비스 이용 시: 할일(Todo) 내용, 팀 정보, AI 챗봇과 주고받은 대화 내용, 알림 내역
            </li>
            <li>자동 수집 항목: 접속 기기 정보, 서비스 이용 기록</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-[16px] mb-2">2. 개인정보의 수집 및 이용 목적</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>회원 식별 및 로그인 등 회원제 서비스 제공</li>
            <li>할일·팀 관리 등 핵심 기능 제공</li>
            <li>AI 챗봇 응답 생성 및 음성 안내(TTS) 제공</li>
            <li>알림 발송 및 서비스 이용 문의 대응</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-[16px] mb-2">3. 개인정보의 보유 및 이용 기간</h2>
          <p>
            이용자가 회원 탈퇴를 요청하는 즉시 개인정보를 지체 없이 파기합니다. 다만 관계 법령에
            따라 보존이 필요한 경우 해당 법령에서 정한 기간 동안 보관합니다.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-[16px] mb-2">4. 개인정보의 제3자 제공</h2>
          <p>
            서비스는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 AI 챗봇 응답 생성
            및 음성 합성(TTS) 기능 제공을 위해 대화 내용 및 텍스트가 관련 AI API 제공업체로 전송될
            수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-[16px] mb-2">5. 이용자의 권리</h2>
          <p>
            이용자는 마이페이지에서 언제든지 본인의 닉네임·프로필 이미지를 수정할 수 있으며, 회원
            탈퇴를 통해 본인의 개인정보 삭제를 요청할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-[16px] mb-2">6. 개인정보 보호책임자 및 문의처</h2>
          <p>개인정보 관련 문의사항은 아래 이메일로 연락해 주세요.</p>
          <p className="mt-1">이메일: syj11243@gmail.com</p>
        </section>

        <section>
          <h2 className="font-bold text-[16px] mb-2">7. 고지의 의무</h2>
          <p>본 방침의 내용이 변경되는 경우 서비스 내 공지를 통해 안내합니다.</p>
        </section>
      </div>
    </div>
  )
}
