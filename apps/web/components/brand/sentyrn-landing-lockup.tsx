import { cn } from "@/lib/utils";
import { SentyrnMark } from "@/components/brand/sentyrn-mark";

type Props = { className?: string };

/** Landing-only: mark + SENTYRN wordmark PNGs (transparent; served without next/image). */
export function SentyrnLandingLockup({ className }: Props) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3 sm:gap-4", className)}>
      <SentyrnMark priority className="h-10 md:h-12" />
      {/* eslint-disable-next-line @next/next/no-img-element -- preserve PNG transparency */}
      <img
        src="/brand/sentyrn-wordmark.png"
        alt="Sentyrn"
        width={669}
        height={64}
        decoding="async"
        fetchPriority="high"
        className="h-7 w-auto max-w-[min(100%,300px)] object-contain object-left sm:h-8 md:h-9"
      />
    </div>
  );
}
