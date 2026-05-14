import Link from "next/link";
import { SentyrnLandingLockup } from "@/components/brand/sentyrn-landing-lockup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 md:px-6">
        <SentyrnLandingLockup />
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="text-frost hover:text-ink" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 md:px-6 md:pt-16">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-frost">Replay infrastructure</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          Understand what happened during every AI coding session.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-frost md:text-xl">
          Sentyrn captures safe telemetry from Cursor, Claude Code, Codex, and more — so teams can
          replay timelines, review findings, and govern agent-assisted workflows without guesswork.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link href="/signup">Get started</Link>
          </Button>
          <Button size="lg" variant="outline" className="border-border text-ink" asChild>
            <Link href="/dashboard">View app shell</Link>
          </Button>
        </div>

        <div className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Replay timeline",
              body: "Chronological reconstruction of prompts, file touches, tests, and policy events.",
            },
            {
              title: "Deterministic findings",
              body: "Rules you can trust — protected paths, failed tests, migrations, and more.",
            },
            {
              title: "Passive governance",
              body: "Warn, record findings, or require approval — without blocking your flow in MVP.",
            },
          ].map((c) => (
            <Card key={c.title} className="border-border bg-surface/60">
              <CardHeader>
                <CardTitle className="text-base text-ink">{c.title}</CardTitle>
                <CardDescription className="text-frost">{c.body}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
