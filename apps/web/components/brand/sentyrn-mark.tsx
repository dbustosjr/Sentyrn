import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  priority?: boolean;
  "aria-label"?: string;
};

/**
 * Native img (not next/image) so the optimizer does not flatten PNG alpha onto black.
 * Asset: /public/brand/sentyrn-mark.png (cropped, transparent).
 */
export function SentyrnMark({
  className,
  priority = false,
  "aria-label": ariaLabel = "Sentyrn",
}: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- preserve PNG transparency
    <img
      src="/brand/sentyrn-mark.png"
      alt={ariaLabel}
      width={245}
      height={219}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className={cn("h-10 w-auto shrink-0 object-contain md:h-12", className)}
    />
  );
}
