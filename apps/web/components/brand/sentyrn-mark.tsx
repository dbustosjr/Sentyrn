import Image from "next/image";
import { cn } from "@/lib/utils";

const MARK_WIDTH = 1024;
const MARK_HEIGHT = 682;

type Props = {
  className?: string;
  priority?: boolean;
  "aria-label"?: string;
};

/** S mark asset — product chrome and favicon contexts; pair with wordmark on landing only. */
export function SentyrnMark({
  className,
  priority = false,
  "aria-label": ariaLabel = "Sentyrn",
}: Props) {
  return (
    <Image
      src="/brand/sentyrn-mark.png"
      alt={ariaLabel}
      width={MARK_WIDTH}
      height={MARK_HEIGHT}
      priority={priority}
      className={cn("h-10 w-auto shrink-0 object-contain md:h-12", className)}
    />
  );
}
