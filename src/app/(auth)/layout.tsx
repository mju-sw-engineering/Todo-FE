export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh max-w-97.5 mx-auto overflow-hidden flex flex-col translate-x-0 bg-white">
      <div className="flex-1 overflow-y-auto flex flex-col">{children}</div>
    </div>
  )
}
