"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  Clock,
  Users,
  MessageSquare,
  Mail,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import type { Reservation, ReservationStatus } from "./types";
import { STATUS_CONFIG, isLunchService, getStatusConfig } from "./constants";

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
      <DialogContent className="max-w-sm">
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
              <Badge variant="outline" className="ml-auto">
                {isLunchService(r.service) ? (
                  <><Sun className="mr-1 h-3 w-3" />{r.service}</>
                ) : (
                  <><Moon className="mr-1 h-3 w-3" />{r.service}</>
                )}
              </Badge>
            </div>
          </div>

          {/* Covers */}
          <div className="flex items-center gap-3 text-sm">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{r.partySize} covers</span>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <a href={`mailto:${r.email}`} className="text-primary underline underline-offset-2">
              {r.email}
            </a>
          </div>

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
            <Select
              value={r.status}
              onValueChange={(val) =>
                onStatusChange(r._id, val as ReservationStatus)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map((key) => (
                  <SelectItem key={key} value={key}>
                    <span className="inline-flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full", STATUS_CONFIG[key].dot)} />
                      {STATUS_CONFIG[key].label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
