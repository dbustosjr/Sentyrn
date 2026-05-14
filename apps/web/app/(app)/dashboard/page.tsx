import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_SESSIONS } from "@/lib/mock/sessions";

export default function DashboardPage() {
  const active = MOCK_SESSIONS.filter((s) => s.status === "needs_review").length;
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-frost">Operational overview · mock data for Phase 1 shell</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active sessions", value: "1", hint: "watching now" },
          { label: "Needs review", value: String(active), hint: "approvals queue" },
          { label: "Repos tracked", value: "2", hint: "acme/*" },
          { label: "Findings (24h)", value: "8", hint: "deterministic" },
        ].map((k) => (
          <Card key={k.label} className="border-border bg-surface/50">
            <CardHeader className="pb-2">
              <CardDescription className="text-frost">{k.label}</CardDescription>
              <CardTitle className="text-3xl font-semibold text-ink">{k.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-frost">{k.hint}</CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-border bg-surface/40">
        <CardHeader>
          <CardTitle className="text-ink">Recent replay activity</CardTitle>
          <CardDescription className="text-frost">Latest sessions across your workspace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {MOCK_SESSIONS.slice(0, 2).map((s) => (
            <Link
              key={s.id}
              href={`/sessions/${s.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-transparent px-2 py-2 text-sm hover:border-border hover:bg-secondary/40"
            >
              <span className="font-mono text-xs text-frost">{s.repo}</span>
              <span className="text-frost">{s.branch}</span>
              <Badge variant="outline" className="font-mono text-[10px]">
                {s.findings} findings
              </Badge>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
