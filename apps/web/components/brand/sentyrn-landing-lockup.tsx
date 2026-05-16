import Image from "next/image";
import { cn } from "@/lib/utils";
import { SentyrnMark } from "@/components/brand/sentyrn-mark";

const WORDMARK_WIDTH = 1024;
const WORDMARK_HEIGHT = 341;

type Props = { className?: string };

/** Landing-only: provided mark + SENTYRN wordmark assets. */
export function SentyrnLandingLockup({ className }: Props) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3 sm:gap-4", className)}>
      <SentyrnMark priority className="h-10 md:h-12" />
      <Image
        src="/brand/sentyrn-wordmark.png"
        alt="Sentyrn"
        width={WORDMARK_WIDTH}
        height={WORDMARK_HEIGHT}
        priority
        className="h-7 w-auto max-w-[min(100%,280px)] object-contain object-left sm:h-8 md:h-9"
      />
    </div>
  );
}
