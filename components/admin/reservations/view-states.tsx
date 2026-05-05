import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type StateDensity = "regular" | "compact";
type ClosedStateVariant = "panel" | "banner" | "cell";
type ClosedStateScope = "day" | "shift";

const NO_RESERVATIONS_LABEL = "No reservations";
const CLOSED_DAY_LABEL = "This day is normally closed";
const CLOSED_SHIFT_LABEL = "This shift is closed";

export function ReservationsEmptyState({
  density = "regular",
  className,
  children,
}: {
  density?: StateDensity;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "text-center text-muted-foreground/50",
        density === "compact" ? "px-2 py-3 text-[10px]" : "px-4 py-4 text-xs",
        className,
      )}
    >
      {children && (
        <div className={cn("mb-1", density === "compact" && "px-1")}>
          {children}
        </div>
      )}
      <span>{NO_RESERVATIONS_LABEL}</span>
    </div>
  );
}

export function ReservationsClosedState({
  variant = "panel",
  scope = "day",
  showEmpty = false,
  className,
}: {
  variant?: ClosedStateVariant;
  scope?: ClosedStateScope;
  showEmpty?: boolean;
  className?: string;
}) {
  const label = scope === "day" ? CLOSED_DAY_LABEL : CLOSED_SHIFT_LABEL;

  if (variant === "banner")
    return (
      <div
        className={cn(
          "shrink-0 flex items-center gap-2 border-b border-destructive/20 bg-destructive/5 px-4 py-2 text-sm text-destructive",
          className,
        )}
      >
        <X className="h-4 w-4 shrink-0" />
        {label}
      </div>
    );

  const isCompact = variant === "cell";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        isCompact ? "min-h-20 px-2 py-3" : "h-full",
        className,
      )}
    >
      <div
        className={cn(
          "inline-flex max-w-full items-center justify-center gap-2 border border-destructive/20 bg-destructive/5 text-destructive",
          isCompact ? "px-2 py-1 text-[10px] leading-tight" : "px-4 py-2 text-sm",
        )}
      >
        <X className={cn("shrink-0", isCompact ? "h-3 w-3" : "h-4 w-4")} />
        <span className="whitespace-normal break-words">{label}</span>
      </div>
      {showEmpty && (
        <ReservationsEmptyState
          density={isCompact ? "compact" : "regular"}
          className={cn("px-0", isCompact ? "py-1" : "pb-0")}
        />
      )}
    </div>
  );
}
