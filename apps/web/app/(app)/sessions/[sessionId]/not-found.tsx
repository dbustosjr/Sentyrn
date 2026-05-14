import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SessionNotFound() {
  return (
    <div className="flex flex-col items-start gap-4 py-12">
      <h1 className="text-xl font-semibold text-ink">Session not found</h1>
      <p className="text-sm text-frost">This id is not in the mock catalog for Phase 1.</p>
      <Button asChild variant="outline">
        <Link href="/sessions">Back to sessions</Link>
      </Button>
    </div>
  );
}
