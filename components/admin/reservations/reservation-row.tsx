import { cn } from "@/lib/utils";
import type { Reservation } from "./types";
import { STATUS_CONFIG } from "./constants";
import { Clock, Users } from "lucide-react";

type ReservationRowProps = {
  reservation: Reservation;
  onClick: () => void;
};

export function ReservationRow({
  reservation: r,
  onClick,
}: ReservationRowProps) {
  const isCancelled = r.status === "cancelled" || r.status === "no_show";
  const isPending = r.status === "pending";
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-start border text-xs p-1 transition-colors hover:bg-muted/60",
        isCancelled && "opacity-40",
        isPending && "border-amber-500/60 bg-amber-50 dark:bg-amber-950/20",
      )}
    >
      <div className="flex items-center justify-between w-full gap-3">
        <span
          className={cn(
            "tabular-nums shrink-0 inline-flex items-center gap-0.5",
            isCancelled && "line-through",
          )}
        >
          <Clock className="h-2 w-2 text-muted-foreground" />
          {r.time}
        </span>
        <span className="shrink-0 inline-flex items-center gap-0.5">
          <Users className="h-2.5 w-2.5 text-muted-foreground" />
          {r.partySize}
        </span>
      </div>
      <span
        className={cn(
          "truncate text-muted-foreground max-w-18",
          isCancelled && "line-through",
        )}
      >
        {r.name}
      </span>
    </button>
  );
}
