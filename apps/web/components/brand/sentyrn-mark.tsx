import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  "aria-label"?: string;
};

/** Geometric S mark — pair with wordmark on landing only; use alone in product chrome. */
export function SentyrnMark({ className, "aria-label": ariaLabel = "Sentyrn" }: Props) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label={ariaLabel}
      role="img"
    >
      <title>{ariaLabel}</title>
      <path
        d="M4 8h22l4 6H8L4 8Z"
        fill="#8E97B8"
        className="rounded-sm"
      />
      <path
        d="M8 18h22l4 6H12l-4-6Z"
        fill="#3C486B"
        className="rounded-sm"
      />
    </svg>
  );
}
