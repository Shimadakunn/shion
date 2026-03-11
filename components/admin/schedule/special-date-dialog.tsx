"use client";

import { useEffect, useState } from "react";
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
import { Calendar as CalendarIcon, Plus, X } from "lucide-react";
import { format, getDay } from "date-fns";
import { type ServiceInput, DAY_LABELS, DEFAULT_SERVICES, TIME_SLOTS } from "./types";
import { ServiceRow } from "./service-row";

export type SpecialDateInitialData = {
  date: Date;
  note: string;
  services: ServiceInput[];
};

type SpecialDateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getServicesForDay: (dayOfWeek: number) => ServiceInput[] | null;
  initialData?: SpecialDateInitialData;
  onSave: (data: {
    date: string;
    isOpen: boolean;
    services?: ServiceInput[];
    note?: string;
  }) => void;
};

export function SpecialDateDialog({
  open,
  onOpenChange,
  getServicesForDay,
  initialData,
  onSave,
}: SpecialDateDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [note, setNote] = useState("");
  const [services, setServices] = useState<ServiceInput[]>([]);

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setSelectedDate(initialData.date);
      setNote(initialData.note);
      setServices(initialData.services.map((s) => ({ ...s })));
    } else {
      setSelectedDate(undefined);
      setNote("");
      setServices([]);
    }
  }, [open, initialData]);

  function handleDateSelected(date: Date | undefined) {
    setSelectedDate(date);
    if (!date) {
      setServices([]);
      return;
    }
    const dayServices = getServicesForDay(getDay(date));
    if (dayServices)
      setServices(dayServices.map((s) => ({ ...s })));
    else
      setServices([]);
  }

  function updateService(index: number, field: keyof ServiceInput, value: string | number) {
    setServices((prev) => {
      const next = [...prev];
      const updated = { ...next[index], [field]: value };
      if (field === "openTime" && updated.closeTime <= String(value)) {
        const nextIdx = TIME_SLOTS.indexOf(String(value)) + 1;
        updated.closeTime = TIME_SLOTS[nextIdx] ?? TIME_SLOTS[TIME_SLOTS.length - 1];
      }
      next[index] = updated;
      return next;
    });
  }

  function handleSave() {
    if (!selectedDate) return;
    onSave({
      date: format(selectedDate, "yyyy-MM-dd"),
      isOpen: services.length > 0,
      services: services.length > 0 ? services : undefined,
      note: note || undefined,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <DialogTitle>{initialData ? "Edit special date" : "Add special date"}</DialogTitle>
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
                {selectedDate
                  ? `${DAY_LABELS[getDay(selectedDate)]}, ${format(selectedDate, "PPP")}`
                  : <span>Pick a date</span>}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelected} weekStartsOn={1} />
              </PopoverContent>
            </Popover>
          </div>

          {selectedDate && (
            <>
              {services.length === 0 ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground italic">
                    No services — this date will be marked as closed.
                  </p>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setServices([{ ...DEFAULT_SERVICES[0] }])}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {services.map((svc, i) => (
                    <ServiceRow
                      key={i}
                      service={svc}
                      onUpdate={(field, value) => updateService(i, field, value)}
                      onRemove={() => setServices((prev) => prev.filter((_, idx) => idx !== i))}
                    />
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setServices((prev) => [...prev, { ...DEFAULT_SERVICES[0] }])}
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add service
                  </Button>
                </div>
              )}

              <div>
                <Label className="mb-1">Note (optional)</Label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Holiday, special event..."
                />
              </div>

              <Button className="w-full" onClick={handleSave}>
                Save special date
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
