"use client";

import { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Lock, Moon, Sun, Trash2, X } from "lucide-react";
import { format, parse, isBefore, startOfDay } from "date-fns";
import type { ServicePeriod } from "./types";
import { formatDateISO, timeToMinutes, minutesToTime } from "./utils";
import { isLunchService } from "./constants";

type BlockedShift = {
  _id: Id<"blockedShifts">;
  date: string;
  service: string;
  startTime?: string;
  endTime?: string;
  note?: string;
};

type BlockShiftDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Returns the services configured for the given date (default schedule + special date overrides). */
  getServicesForDate: (date: string) => ServicePeriod[];
  blockedShifts: BlockedShift[];
};

function buildSlots(openTime: string, closeTime: string): string[] {
  const open = timeToMinutes(openTime);
  const close = timeToMinutes(closeTime);
  const slots: string[] = [];
  for (let m = open; m <= close; m += 15) slots.push(minutesToTime(m));
  return slots;
}

export function BlockShiftDialog({
  open,
  onOpenChange,
  getServicesForDate,
  blockedShifts,
}: BlockShiftDialogProps) {
  const addBlock = useMutation(api.blocked.add);
  const removeBlock = useMutation(api.blocked.remove);

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedService, setSelectedService] = useState<string>("");
  const [customHours, setCustomHours] = useState(false);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [note, setNote] = useState("");

  // Reset form when dialog opens.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSelectedDate(undefined);
      setSelectedService("");
      setCustomHours(false);
      setStartTime("");
      setEndTime("");
      setNote("");
    }
  }

  const dateStr = selectedDate ? formatDateISO(selectedDate) : null;
  const servicesForDate = useMemo(
    () => (dateStr ? getServicesForDate(dateStr) : []),
    [dateStr, getServicesForDate],
  );

  const selectedSvc = useMemo(
    () => servicesForDate.find((s) => s.name === selectedService),
    [servicesForDate, selectedService],
  );

  // When user toggles custom hours on, default start/end to service window.
  function handleCustomHoursToggle() {
    const next = !customHours;
    setCustomHours(next);
    if (next && selectedSvc) {
      setStartTime(selectedSvc.openTime);
      setEndTime(selectedSvc.closeTime);
    }
  }

  function handleServiceChange(name: string) {
    setSelectedService(name);
    setCustomHours(false);
    setStartTime("");
    setEndTime("");
  }

  function handleDateSelected(date: Date | undefined) {
    setSelectedDate(date);
    setSelectedService("");
    setCustomHours(false);
  }

  const startSlots = useMemo(
    () => (selectedSvc ? buildSlots(selectedSvc.openTime, selectedSvc.closeTime) : []),
    [selectedSvc],
  );

  const endSlots = useMemo(
    () => startSlots.filter((t) => !startTime || t > startTime),
    [startSlots, startTime],
  );

  const canSave =
    !!dateStr &&
    !!selectedService &&
    (!customHours || (!!startTime && !!endTime && startTime < endTime));

  async function handleSave() {
    if (!canSave || !dateStr) return;
    await addBlock({
      date: dateStr,
      service: selectedService,
      startTime: customHours ? startTime : undefined,
      endTime: customHours ? endTime : undefined,
      note: note || undefined,
    });
    setSelectedService("");
    setCustomHours(false);
    setStartTime("");
    setEndTime("");
    setNote("");
  }

  const today = startOfDay(new Date());
  const futureBlocks = useMemo(
    () =>
      [...blockedShifts]
        .filter((b) => !isBefore(parse(b.date, "yyyy-MM-dd", new Date()), today))
        .sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.service.localeCompare(b.service);
        }),
    [blockedShifts, today],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <DialogTitle>
            <Lock className="mr-2 inline h-3.5 w-3.5" />
            Block reservations
          </DialogTitle>
          <DialogClose render={<Button variant="ghost" size="icon-xs" />}>
            <X className="h-4 w-4" />
          </DialogClose>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="mb-1">Date</Label>
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    data-empty={!selectedDate}
                    className="w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                  />
                }
              >
                <CalendarIcon className="h-4 w-4" />
                {selectedDate ? format(selectedDate, "EEEE, PPP") : <span>Pick a date</span>}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelected}
                  weekStartsOn={1}
                  disabled={(d) => isBefore(d, today)}
                />
              </PopoverContent>
            </Popover>
          </div>

          {selectedDate && servicesForDate.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No service is open on this date — nothing to block.
            </p>
          )}

          {selectedDate && servicesForDate.length > 0 && (
            <div>
              <Label className="mb-1">Service</Label>
              <Select
                value={selectedService}
                onValueChange={(v) => { if (v) handleServiceChange(v); }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick a service to block" />
                </SelectTrigger>
                <SelectContent>
                  {servicesForDate.map((svc) => (
                    <SelectItem key={svc.name} value={svc.name}>
                      {isLunchService(svc.name) ? (
                        <Sun className="h-3.5 w-3.5" />
                      ) : (
                        <Moon className="h-3.5 w-3.5" />
                      )}
                      <span className="capitalize">{svc.name}</span>
                      <span className="text-muted-foreground ml-1">
                        ({svc.openTime}–{svc.closeTime})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedSvc && (
            <div>
              <button
                type="button"
                onClick={handleCustomHoursToggle}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <span
                  className={`flex h-3.5 w-3.5 items-center justify-center border ${
                    customHours ? "bg-primary border-primary" : "border-border"
                  }`}
                >
                  {customHours && <span className="h-1.5 w-1.5 bg-primary-foreground" />}
                </span>
                Custom hours within the service
              </button>

              {customHours && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <Select value={startTime} onValueChange={(v) => { if (v) setStartTime(v); }}>
                    <SelectTrigger className="w-[5rem]">
                      <SelectValue placeholder="Start" />
                    </SelectTrigger>
                    <SelectContent>
                      {startSlots.slice(0, -1).map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground">—</span>
                  <Select value={endTime} onValueChange={(v) => { if (v) setEndTime(v); }}>
                    <SelectTrigger className="w-[5rem]">
                      <SelectValue placeholder="End" />
                    </SelectTrigger>
                    <SelectContent>
                      {endSlots.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {selectedService && (
            <div>
              <Label className="mb-1">Note (optional)</Label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Private event, anniversary..."
              />
            </div>
          )}

          {selectedService && (
            <Button className="w-full" onClick={handleSave} disabled={!canSave}>
              <Lock className="h-3.5 w-3.5" />
              Block this shift
            </Button>
          )}
        </div>

        {futureBlocks.length > 0 && (
          <div className="mt-6 border-t border-border pt-4">
            <Label className="mb-2 block">Currently blocked shifts</Label>
            <div className="space-y-2">
              {futureBlocks.map((b) => {
                const dateLabel = format(
                  parse(b.date, "yyyy-MM-dd", new Date()),
                  "EEE d MMM",
                );
                const window = b.startTime && b.endTime
                  ? `${b.startTime}–${b.endTime}`
                  : "whole service";
                return (
                  <div
                    key={b._id}
                    className="flex items-center gap-2 border border-border px-2 py-1.5 text-xs"
                  >
                    <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="capitalize font-medium">{dateLabel}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="capitalize">{b.service}</span>
                    <span className="text-muted-foreground">({window})</span>
                    {b.note && (
                      <span className="text-muted-foreground italic truncate">
                        — {b.note}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="ml-auto"
                      onClick={() => removeBlock({ id: b._id })}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
