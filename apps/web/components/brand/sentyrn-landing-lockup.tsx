import { cn } from "@/lib/utils";
import { SentyrnMark } from "@/components/brand/sentyrn-mark";

type Props = { className?: string };

/** Landing-only: mark + “Sentyrn” wordmark (accent on “y” per brand direction). */
export function SentyrnLandingLockup({ className }: Props) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <SentyrnMark className="h-10 w-10 md:h-12 md:w-12" />
      <span
        className="text-2xl font-semibold tracking-[0.22em] text-ink md:text-3xl"
        style={{ fontFeatureSettings: '"ss01"' }}
      >
        SENT
        <span className="text-crimson">Y</span>
        RN
      </span>
    </div>
  );
}
