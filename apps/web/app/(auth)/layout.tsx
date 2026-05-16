import { SentyrnMark } from "@/components/brand/sentyrn-mark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-12">
      <div className="mb-8 flex justify-center">
        <SentyrnMark className="h-10" />
        <h1 className="sr-only">Authentication</h1>
      </div>
      {children}
    </div>
  );
}
