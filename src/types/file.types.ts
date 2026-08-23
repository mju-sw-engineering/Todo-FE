export interface PresignedUploadRequest {
  type: 'PROFILE' | 'TEAM' | 'PROOF'
  fileName: string
  contentType: string
  /**
   * 압축까지 끝난 실제 업로드 크기(byte).
   * 서버가 이 크기로 presigned URL을 서명하므로 다른 크기로는 업로드할 수 없다.
   * 빼먹으면 크기 제한 없이 서명되어 스토리지에 임의 용량을 밀어넣을 수 있다.
   */
  fileSize: number
  /**
   * 회원가입 중 아직 로그인 상태가 아닐 때 보내는 신원 토큰.
   * 이메일 가입은 emailVerificationToken, 애플 가입은 setupToken을 그대로 넣는다.
   * 서버가 발급 한도를 IP 대신 가입자 단위로 세므로, 학교처럼 여러 명이 같은 공인 IP를
   * 쓰는 곳에서 동시에 가입해도 서로 한도를 잡아먹지 않는다.
   */
  signupToken?: string
  /** PROOF 타입에만 필수 — 인증 파일이 속할 투두 ID */
  todoId?: number
}

export interface PresignedUploadResponse {
  uploadUrl: string
  objectKey: string
}
