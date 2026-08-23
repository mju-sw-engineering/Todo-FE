import { FiFile, FiX } from 'react-icons/fi'
import { formatFileSize } from '@/lib/proofFile'

interface ProofFileCardProps {
  fileName: string
  fileSize: number
  onRemove: () => void
}

export function ProofFileCard({ fileName, fileSize, onRemove }: ProofFileCardProps) {
  return (
    <div className="flex shrink-0 items-center gap-3 rounded-[18px] border border-border bg-gray-50 px-4 py-3.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
        <FiFile size={18} className="text-muted" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-ink">{fileName}</p>
        <p className="text-[11px] text-muted">{formatFileSize(fileSize)}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-gray-100 hover:text-ink"
        aria-label="파일 삭제"
      >
        <FiX size={16} />
      </button>
    </div>
  )
}
