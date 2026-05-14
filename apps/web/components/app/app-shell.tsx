"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LayoutDashboard, ListVideo, ShieldAlert, Settings } from "lucide-react";
import { SentyrnMark } from "@/components/brand/sentyrn-mark";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sessions", label: "Sessions", icon: ListVideo },
  { href: "/findings", label: "Findings", icon: ShieldAlert },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1" aria-label="Primary">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-secondary text-ink"
                : "text-frost hover:bg-secondary/60 hover:text-ink",
            )}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  children,
  sidePanel,
}: {
  children: React.ReactNode;
  sidePanel?: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-canvas lg:flex-row">
      {/* Desktop sidebar — logo mark only (no wordmark) */}
      <aside className="hidden w-56 shrink-0 border-r border-border bg-surface/40 lg:flex lg:flex-col">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <Link href="/dashboard" className="flex items-center gap-2" aria-label="Dashboard home">
            <SentyrnMark className="h-8 w-8" />
          </Link>
        </div>
        <ScrollArea className="flex-1 px-3 py-4">
          <NavLinks />
        </ScrollArea>
        <div className="border-t border-border p-3">
          <Button variant="outline" size="sm" className="w-full border-border text-frost" asChild>
            <Link href="/">Exit to marketing</Link>
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-surface/60 px-3 lg:hidden">
        <div className="flex items-center gap-2">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-border bg-canvas p-0">
              <SheetHeader className="border-b border-border px-4 py-3 text-left">
                <SheetTitle className="flex items-center gap-2 text-ink">
                  <SentyrnMark className="h-8 w-8" />
                  <span className="sr-only">Navigation</span>
                </SheetTitle>
              </SheetHeader>
              <div className="p-3">
                <NavLinks onNavigate={() => setMobileNavOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/dashboard" aria-label="Dashboard home">
            <SentyrnMark className="h-8 w-8" />
          </Link>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">Home</Link>
        </Button>
      </header>

      <div className="flex flex-1 min-w-0 flex-col lg:flex-row">
        <main className="flex-1 min-w-0 overflow-x-hidden p-4 md:p-6">{children}</main>
        {sidePanel ? (
          <>
            <Separator orientation="vertical" className="hidden bg-border lg:block" />
            <aside className="hidden w-80 shrink-0 border-l border-border bg-surface/30 lg:block">
              {sidePanel}
            </aside>
            {/* Mobile: findings / panel as sheet — simplified: collapsible block below main */}
            <div className="border-t border-border bg-surface/30 p-4 lg:hidden">{sidePanel}</div>
          </>
        ) : null}
      </div>
    </div>
  );
}
