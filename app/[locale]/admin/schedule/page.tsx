"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Moon, Pencil, Plus, Sun, Trash2, Users } from "lucide-react";
import { format, isBefore, parse, startOfDay } from "date-fns";
import { type ServiceInput, DEFAULT_SERVICES, TIME_SLOTS } from "@/components/admin/schedule/types";
import { DayScheduleCard } from "@/components/admin/schedule/day-schedule-card";
import { SpecialDateDialog, type SpecialDateInitialData } from "@/components/admin/schedule/special-date-dialog";

const DAYS = [1, 2, 3, 4, 5, 6, 0];

export default function AdminSchedulePage() {
  const schedule = useQuery(api.schedule.getAll);
  const specialDates = useQuery(api.schedule.getSpecialDates);
  const upsertDay = useMutation(api.schedule.upsert);
  const upsertSpecial = useMutation(api.schedule.upsertSpecialDate);
  const removeSpecial = useMutation(api.schedule.removeSpecialDate);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState<SpecialDateInitialData>();

  function getScheduleForDay(day: number) {
    return schedule?.find((s) => s.dayOfWeek === day);
  }

  function getServicesForDay(dayOfWeek: number): ServiceInput[] | null {
    const daySchedule = getScheduleForDay(dayOfWeek);
    if (daySchedule?.isOpen && daySchedule.services.length > 0)
      return daySchedule.services;
    return null;
  }

  async function addService(day: number) {
    const existing = getScheduleForDay(day);
    await upsertDay({
      dayOfWeek: day,
      isOpen: true,
      services: [...(existing?.services ?? []), DEFAULT_SERVICES[0]],
    });
  }

  async function updateService(day: number, index: number, field: keyof ServiceInput, value: string | number) {
    const existing = getScheduleForDay(day);
    if (!existing) return;

    const services = [...existing.services];
    const updated = { ...services[index], [field]: value };

    if (field === "openTime" && updated.closeTime <= String(value)) {
      const nextIdx = TIME_SLOTS.indexOf(String(value)) + 1;
      updated.closeTime = TIME_SLOTS[nextIdx] ?? TIME_SLOTS[TIME_SLOTS.length - 1];
    }

    services[index] = updated;
    await upsertDay({ dayOfWeek: day, isOpen: existing.isOpen, services });
  }

  async function removeService(day: number, index: number) {
    const existing = getScheduleForDay(day);
    if (!existing) return;
    await upsertDay({
      dayOfWeek: day,
      isOpen: existing.isOpen,
      services: existing.services.filter((_, i) => i !== index),
    });
  }

  function openCreateDialog() {
    setEditingData(undefined);
    setDialogOpen(true);
  }

  function openEditDialog(sd: NonNullable<typeof specialDates>[number]) {
    setEditingData({
      date: parse(sd.date, "yyyy-MM-dd", new Date()),
      note: sd.note ?? "",
      services: sd.services?.map((s) => ({ ...s })) ?? [],
    });
    setDialogOpen(true);
  }

  const futureSpecialDates = specialDates?.filter(
    (sd) => !isBefore(parse(sd.date, "yyyy-MM-dd", new Date()), startOfDay(new Date())),
  );

  return (
    <div>
      <h1 className="mb-6 sm:mb-8 text-lg sm:text-xl font-light tracking-[0.2em] uppercase">
        Schedule management
      </h1>

      <h2 className="mb-4 text-sm font-medium tracking-wider uppercase">
        Default schedule
      </h2>

      <div className="mb-12 space-y-3">
        {DAYS.map((day) => {
          const daySchedule = getScheduleForDay(day);
          const hasServices = (daySchedule?.services?.length ?? 0) > 0;
          const isOpen = (daySchedule?.isOpen ?? false) && hasServices;

          return (
            <DayScheduleCard
              key={day}
              day={day}
              isOpen={isOpen}
              services={daySchedule?.services ?? []}
              onAddService={() => addService(day)}
              onUpdateService={(i, field, value) => updateService(day, i, field, value)}
              onRemoveService={(i) => removeService(day, i)}
            />
          );
        })}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium tracking-wider uppercase">
          Special dates
        </h2>
        <Button variant="ghost" size="icon-xs" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <SpecialDateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        getServicesForDay={getServicesForDay}
        initialData={editingData}
        onSave={(data) => upsertSpecial(data)}
      />

      <div className="space-y-3">
        {futureSpecialDates?.map((sd) => {
          const hasServices = (sd.services?.length ?? 0) > 0;
          const isOpen = sd.isOpen && hasServices;

          return (
            <div key={sd._id} className="border border-border p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
                  <span className="text-sm font-medium">
                    {format(parse(sd.date, "yyyy-MM-dd", new Date()), "EEEE d MMMM")}
                  </span>
                  <Badge
                    className={
                      isOpen
                        ? "bg-green-600/15 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                        : "bg-red-600/15 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                    }
                  >
                    {isOpen ? "Open" : "Closed"}
                  </Badge>
                  {sd.note && (
                    <span className="text-muted-foreground text-xs italic">
                      {sd.note}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => openEditDialog(sd)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon-xs"
                    onClick={() => removeSpecial({ id: sd._id })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {isOpen && sd.services && (
                <div className="mt-3 space-y-2">
                  {sd.services.map((svc, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <span className="flex items-center gap-1.5 w-28">
                        {svc.name === "lunch" && <><Sun className="h-3.5 w-3.5" />Lunch</>}
                        {svc.name === "dinner" && <><Moon className="h-3.5 w-3.5" />Dinner</>}
                        {svc.name !== "lunch" && svc.name !== "dinner" && svc.name}
                      </span>
                      <span>{svc.openTime}</span>
                      <span className="text-muted-foreground">—</span>
                      <span>{svc.closeTime}</span>
                      <span className="flex items-center gap-1.5 ml-auto sm:ml-2">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{svc.maxCovers}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
