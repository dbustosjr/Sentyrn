import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_SESSIONS, MOCK_TIMELINE } from "@/lib/mock/sessions";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ sessionId: string }> };

export default async function SessionReplayPage({ params }: Props) {
  const { sessionId } = await params;
  const session = MOCK_SESSIONS.find((s) => s.id === sessionId);
  if (!session) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" className="-ml-2 mb-2 text-frost hover:text-ink" asChild>
            <Link href="/sessions">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Sessions
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Replay</h1>
          <p className="mt-1 font-mono text-xs text-frost">
            {session.repo} · {session.branch} · {session.model}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="font-mono text-[10px]">
            {session.id}
          </Badge>
          <Badge variant="secondary">{session.findings} findings</Badge>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface/40 p-4 md:p-6">
        <h2 className="text-sm font-medium uppercase tracking-wide text-frost">Timeline</h2>
        <ol className="relative ml-1 mt-6 border-l border-border pl-8">
          {MOCK_TIMELINE.map((ev) => (
            <li key={ev.id} className="relative pb-8 last:pb-0">
              <span
                className={cn(
                  "absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-canvas",
                  ev.tone === "warning"
                    ? "bg-crimson"
                    : ev.tone === "success"
                      ? "bg-success"
                      : "bg-frost",
                )}
                aria-hidden
              />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <time className="font-mono text-xs text-frost">{ev.at}</time>
                <span className="text-sm font-medium text-ink">{ev.label}</span>
                <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wide">
                  {ev.type}
                </Badge>
              </div>
              {ev.detail ? (
                <p
                  className={cn(
                    "mt-1 font-mono text-xs leading-relaxed",
                    ev.tone === "warning" ? "text-crimson/90" : "text-frost",
                  )}
                >
                  {ev.detail}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
