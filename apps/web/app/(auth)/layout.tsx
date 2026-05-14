export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-12">
      <div className="mb-8 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-frost">Sentyrn</p>
        <h1 className="sr-only">Authentication</h1>
      </div>
      {children}
    </div>
  );
}
