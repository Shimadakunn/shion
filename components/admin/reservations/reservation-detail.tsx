"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  Clock,
  Users,
  MessageSquare,
  Mail,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import type { Reservation, ReservationStatus } from "./types";
import { STATUS_CONFIG, getStatusConfig } from "./constants";

const DIALOG_STATUSES: ReservationStatus[] = ["pending", "confirmed", "cancelled"];

type ReservationDetailProps = {
  reservation: Reservation | null;
  onStatusChange: (id: Id<"reservations">, status: ReservationStatus) => void;
  onClose: () => void;
};

export function ReservationDetail({
  reservation: r,
  onStatusChange,
  onClose,
}: ReservationDetailProps) {
  if (!r) return null;

  const config = getStatusConfig(r.status);

  const dateObj = new Date(r.date);
  const dateLabel = dateObj.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-lg">
        <DialogTitle>
          <span className={cn(config.dismissed && "line-through opacity-60")}>
            {r.name}
          </span>
        </DialogTitle>
        <DialogDescription className="sr-only">
          Reservation details for {r.name}
        </DialogDescription>

        <div className="mt-3 space-y-4">
          <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium border-l-2", config.border, config.bg, config.text)}>
            <span className={cn("h-2 w-2 rounded-full", config.dot)} />
            {config.label}
          </div>

          {/* Date & Time */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="capitalize">{dateLabel}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="tabular-nums">{r.time}</span>
            </div>
          </div>

          {/* Covers */}
          <div className="flex items-center gap-3 text-sm">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{r.partySize} covers</span>
          </div>

          {/* Contact */}
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <a href={`mailto:${r.email}`} className="text-primary underline underline-offset-2">
              {r.email}
            </a>
          </div>
          {r.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <a href={`tel:${r.phone}`} className="text-primary underline underline-offset-2">
                {r.phone}
              </a>
            </div>
          )}

          {/* Notes */}
          {r.notes && (
            <>
              <hr className="border-border" />
              <div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Notes
                </div>
                <p className="text-sm italic">{r.notes}</p>
              </div>
            </>
          )}

          <hr className="border-border" />

          {/* Status change */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">
              Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DIALOG_STATUSES.map((key) => {
                const s = STATUS_CONFIG[key];
                const active = r.status === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { if (!active) onStatusChange(r._id, key); }}
                    className={cn(
                      "inline-flex items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-sm font-medium transition-colors truncate",
                      active
                        ? cn(s.bg, s.text, s.border, "border-l-2")
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <span className={cn("h-2 w-2 rounded-full", s.dot)} />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
