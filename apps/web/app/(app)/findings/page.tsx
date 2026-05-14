import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_FINDINGS } from "@/lib/mock/sessions";

export default function FindingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Findings</h1>
        <p className="mt-1 text-sm text-frost">Deterministic workflow signals · no LLM speculation</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {MOCK_FINDINGS.map((f) => (
          <Card key={f.id} className="border-border bg-surface/50">
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
              <div>
                <CardTitle className="text-base text-ink">{f.title}</CardTitle>
                <CardDescription className="font-mono text-xs text-frost">{f.rule}</CardDescription>
              </div>
              <Badge variant={f.severity === "high" ? "destructive" : "secondary"}>{f.severity}</Badge>
            </CardHeader>
            <CardContent className="text-xs text-frost">Session {f.sessionId}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
