export default function TeamsDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="h-dvh flex flex-col overflow-hidden bg-surface md:items-center md:justify-start md:py-16"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 20% 20%, rgba(91,79,207,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(91,79,207,0.05) 0%, transparent 60%)',
      }}
    >
      <div className="flex-1 flex flex-col min-h-0 md:flex-none md:w-90">{children}</div>
    </div>
  )
}
