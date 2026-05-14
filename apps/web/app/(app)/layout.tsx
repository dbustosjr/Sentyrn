import { AppLayoutClient } from "@/components/app/app-layout-client";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutClient>{children}</AppLayoutClient>;
}
