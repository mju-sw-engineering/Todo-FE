export function Toast({ message }: { message: string }) {
  return (
    <div className="fixed top-0 left-0 right-0 flex justify-center z-50 pt-4 pointer-events-none">
      <div className="max-w-sm w-full mx-auto px-5">
        <div className="bg-ink/90 text-white text-[13px] font-medium rounded-xl shadow-lg px-4 py-2.5 text-center">
          {message}
        </div>
      </div>
    </div>
  )
}
