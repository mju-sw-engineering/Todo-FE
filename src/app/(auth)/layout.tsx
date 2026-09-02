export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh max-w-app mx-auto overflow-hidden flex flex-col translate-x-0 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="flex-1 overflow-y-auto flex flex-col pt-[env(safe-area-inset-top)]">
        {children}
      </div>
    </div>
  )
}
