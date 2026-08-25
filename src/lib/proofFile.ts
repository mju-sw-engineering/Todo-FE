export type ProofFileCategory = 'IMAGE' | 'DOCUMENT' | 'HWP'

interface ProofFileRule {
  category: ProofFileCategory
  extensions: string[]
  mimeTypes: string[]
  maxSize: number
}

const MB = 1024 * 1024

const IMAGE_RULE: ProofFileRule = {
  category: 'IMAGE',
  extensions: ['jpg', 'jpeg', 'png', 'webp'],
  mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxSize: 5 * MB,
}

const DOCUMENT_RULE: ProofFileRule = {
  category: 'DOCUMENT',
  extensions: ['pdf', 'docx', 'xlsx', 'csv'],
  mimeTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/csv',
  ],
  maxSize: 20 * MB,
}

const HWP_RULE: ProofFileRule = {
  category: 'HWP',
  extensions: ['hwp', 'hwpx'],
  mimeTypes: [
    'application/x-hwp',
    'application/vnd.hancom.hwpx',
    'application/hwp+zip',
    'application/octet-stream',
  ],
  maxSize: 20 * MB,
}

const RULES = [IMAGE_RULE, DOCUMENT_RULE, HWP_RULE]

/**
 * 확장자만 나열하면 iOS Safari 등 일부 모바일 브라우저가 "사진 보관함"을
 * 인식하지 못하고 카메라로 바로 넘어간다. MIME 타입도 함께 나열해야
 * 갤러리(파일 선택) 옵션이 안정적으로 뜬다.
 */
export const PROOF_FILE_ACCEPT = RULES.flatMap((rule) => [
  ...rule.extensions.map((ext) => `.${ext}`),
  ...rule.mimeTypes,
]).join(',')

function getExtension(fileName: string): string {
  const dot = fileName.lastIndexOf('.')
  return dot > 0 ? fileName.slice(dot + 1).toLowerCase() : ''
}

function classify(file: File): ProofFileRule | null {
  const ext = getExtension(file.name)
  return RULES.find((rule) => rule.extensions.includes(ext)) ?? null
}

export function getProofFileCategory(file: File): ProofFileCategory | null {
  return classify(file)?.category ?? null
}

export function isHwpFile(file: File): boolean {
  return getProofFileCategory(file) === 'HWP'
}

export function isProofImageFile(file: File): boolean {
  return getProofFileCategory(file) === 'IMAGE'
}

export function getProofUploadContentType(file: File): string {
  if (file.type) return file.type
  const rule = classify(file)
  return rule ? rule.mimeTypes[0] : 'application/octet-stream'
}

export function validateProofFile(file: File): string | null {
  const rule = classify(file)
  if (!rule) return '지원하지 않는 파일 형식이에요.'
  if (file.size > rule.maxSize) {
    return `파일 용량은 ${rule.maxSize / MB}MB까지 업로드할 수 있어요.`
  }
  return null
}

export function formatFileSize(bytes: number): string {
  if (bytes < MB) return `${Math.max(1, Math.round(bytes / 1024))}KB`
  return `${(bytes / MB).toFixed(1)}MB`
}
