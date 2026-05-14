import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_SESSIONS } from "@/lib/mock/sessions";

const statusLabel: Record<string, string> = {
  approved: "Approved",
  needs_review: "Needs review",
  risk_accepted: "Risk accepted",
};

export default function SessionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Sessions</h1>
        <p className="mt-1 text-sm text-frost">Repo, branch, model, duration, findings, review status</p>
      </div>
      <Card className="border-border bg-surface/40">
        <CardHeader>
          <CardTitle className="text-lg text-ink">All sessions</CardTitle>
          <CardDescription className="text-frost">Click a row to open replay · Phase 1 mock</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-frost">
                <th className="pb-3 pr-4 font-medium">Repository</th>
                <th className="pb-3 pr-4 font-medium">Branch</th>
                <th className="pb-3 pr-4 font-medium">Model</th>
                <th className="pb-3 pr-4 font-medium">Duration</th>
                <th className="pb-3 pr-4 font-medium">Findings</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SESSIONS.map((s) => (
                <tr key={s.id} className="border-b border-border/80 last:border-0">
                  <td className="py-3 pr-4">
                    <Link href={`/sessions/${s.id}`} className="font-mono text-xs text-ink hover:underline">
                      {s.repo}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-frost">{s.branch}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-frost">{s.model}</td>
                  <td className="py-3 pr-4 text-frost">{s.durationMin}m</td>
                  <td className="py-3 pr-4">
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {s.findings}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <Badge
                      variant={s.status === "needs_review" ? "destructive" : "outline"}
                      className="text-[10px]"
                    >
                      {statusLabel[s.status]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
