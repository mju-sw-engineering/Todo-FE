import { Spinner } from '@/components/ui/Spinner'

export function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center bg-white">
      <Spinner />
    </div>
  )
}
