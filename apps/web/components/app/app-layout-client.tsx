"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { MOCK_FINDINGS, MOCK_SESSIONS } from "@/lib/mock/sessions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

function RecentFindingsPanel() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">Recent findings</h2>
        <p className="text-xs text-frost">Mock data · Phase 1 shell</p>
      </div>
      <ScrollArea className="flex-1 px-3 py-3">
        <ul className="space-y-3">
          {MOCK_FINDINGS.map((f) => (
            <li key={f.id}>
              <Card className="border-border bg-card/80">
                <CardHeader className="space-y-1 p-3 pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm font-medium leading-snug text-ink">{f.title}</CardTitle>
                    <Badge
                      variant={f.severity === "high" ? "destructive" : "secondary"}
                      className="shrink-0 text-[10px] uppercase tracking-wide"
                    >
                      {f.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-2">
                  <p className="font-mono text-[11px] text-frost">{f.rule}</p>
                  <p className="mt-1 text-[11px] text-frost">Session {f.sessionId}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}

function SessionDetailPanel({ sessionId }: { sessionId: string }) {
  const session = MOCK_SESSIONS.find((s) => s.id === sessionId);
  const related = MOCK_FINDINGS.filter((f) => f.sessionId === sessionId);
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">Findings & approvals</h2>
        <p className="text-xs text-frost">{session?.repo ?? "Session"} · {session?.branch ?? "—"}</p>
      </div>
      <ScrollArea className="flex-1 px-3 py-3">
        <div className="space-y-3">
          {related.length === 0 ? (
            <p className="text-sm text-frost">No findings for this session.</p>
          ) : (
            related.map((f) => (
              <Card key={f.id} className="border-border bg-card/80">
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm text-ink">{f.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-2">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {f.rule}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
          <Separator className="bg-border" />
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-frost">Approval</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" disabled title="Phase 2">
                Approve
              </Button>
              <Button size="sm" variant="outline" disabled title="Phase 2">
                Needs review
              </Button>
              <Button size="sm" variant="ghost" className="text-frost" disabled title="Phase 2">
                Risk accepted
              </Button>
            </div>
            <p className="text-[11px] text-frost">Actions wire to InsForge in Phase 2.</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const sessionMatch = pathname.match(/^\/sessions\/([^/]+)$/);
  const sessionId = sessionMatch?.[1];

  const sidePanel =
    pathname.startsWith("/settings") ? null : sessionId ? (
      <SessionDetailPanel sessionId={sessionId} />
    ) : (
      <RecentFindingsPanel />
    );

  return <AppShell sidePanel={sidePanel ?? undefined}>{children}</AppShell>;
}
