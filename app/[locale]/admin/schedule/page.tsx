"use client";

import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";

type ServiceInput = {
  name: string;
  openTime: string;
  closeTime: string;
  maxCovers: number;
};

export default function AdminSchedulePage() {
  const t = useTranslations("admin.scheduleEditor");
  const schedule = useQuery(api.schedule.getAll);
  const specialDates = useQuery(api.schedule.getSpecialDates);
  const upsertDay = useMutation(api.schedule.upsert);
  const upsertSpecial = useMutation(api.schedule.upsertSpecialDate);
  const removeSpecial = useMutation(api.schedule.removeSpecialDate);

  // Special date form
  const [newDate, setNewDate] = useState("");
  const [newDateOpen, setNewDateOpen] = useState(false);
  const [newDateNote, setNewDateNote] = useState("");

  const days = Array.from({ length: 7 }, (_, i) => i);

  function getScheduleForDay(day: number) {
    return schedule?.find((s) => s.dayOfWeek === day);
  }

  async function toggleDay(day: number) {
    const existing = getScheduleForDay(day);
    await upsertDay({
      dayOfWeek: day,
      isOpen: existing ? !existing.isOpen : true,
      services: existing?.services ?? [
        { name: "Midi", openTime: "12:00", closeTime: "14:00", maxCovers: 30 },
        { name: "Soir", openTime: "19:00", closeTime: "22:00", maxCovers: 30 },
      ],
    });
  }

  async function updateService(
    day: number,
    serviceIndex: number,
    field: keyof ServiceInput,
    value: string | number,
  ) {
    const existing = getScheduleForDay(day);
    if (!existing) return;

    const services = [...existing.services];
    services[serviceIndex] = { ...services[serviceIndex], [field]: value };

    await upsertDay({
      dayOfWeek: day,
      isOpen: existing.isOpen,
      services,
    });
  }

  async function addService(day: number) {
    const existing = getScheduleForDay(day);
    const services = existing?.services ?? [];
    await upsertDay({
      dayOfWeek: day,
      isOpen: existing?.isOpen ?? true,
      services: [
        ...services,
        { name: "Service", openTime: "12:00", closeTime: "14:00", maxCovers: 30 },
      ],
    });
  }

  async function removeService(day: number, serviceIndex: number) {
    const existing = getScheduleForDay(day);
    if (!existing) return;
    const services = existing.services.filter((_, i) => i !== serviceIndex);
    await upsertDay({
      dayOfWeek: day,
      isOpen: existing.isOpen,
      services,
    });
  }

  async function addSpecialDate() {
    if (!newDate) return;
    await upsertSpecial({
      date: newDate,
      isOpen: newDateOpen,
      note: newDateNote || undefined,
    });
    setNewDate("");
    setNewDateNote("");
  }

  return (
    <div>
      <h1 className="mb-8 text-xl font-light tracking-[0.2em] uppercase">
        {t("title")}
      </h1>

      {/* Default schedule */}
      <h2 className="mb-4 text-sm font-medium tracking-wider uppercase">
        {t("defaultSchedule")}
      </h2>

      <div className="mb-12 space-y-3">
        {days.map((day) => {
          const daySchedule = getScheduleForDay(day);
          const isOpen = daySchedule?.isOpen ?? false;

          return (
            <div key={day} className="border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="w-24 text-sm font-medium">
                    {t(`days.${day}`)}
                  </span>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => toggleDay(day)}
                  >
                    <Badge variant={isOpen ? "default" : "destructive"}>
                      {isOpen ? t("open") : t("closed")}
                    </Badge>
                  </Button>
                </div>
                {isOpen && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => addService(day)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {isOpen && daySchedule?.services && (
                <div className="mt-3 space-y-2">
                  {daySchedule.services.map((svc, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <Input
                        value={svc.name}
                        onChange={(e) => updateService(day, i, "name", e.target.value)}
                        className="w-24"
                      />
                      <Input
                        type="time"
                        value={svc.openTime}
                        onChange={(e) => updateService(day, i, "openTime", e.target.value)}
                        className="w-28"
                      />
                      <span className="text-muted-foreground">—</span>
                      <Input
                        type="time"
                        value={svc.closeTime}
                        onChange={(e) => updateService(day, i, "closeTime", e.target.value)}
                        className="w-28"
                      />
                      <Input
                        type="number"
                        value={svc.maxCovers}
                        onChange={(e) => updateService(day, i, "maxCovers", Number(e.target.value))}
                        className="w-16"
                      />
                      <span className="text-muted-foreground text-xs">max</span>
                      <Button
                        variant="destructive"
                        size="icon-xs"
                        onClick={() => removeService(day, i)}
                        className="ml-auto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Special dates */}
      <h2 className="mb-4 text-sm font-medium tracking-wider uppercase">
        {t("specialDates")}
      </h2>

      <div className="mb-4 flex items-end gap-3 border border-border p-4">
        <div>
          <Label className="mb-1">Date</Label>
          <Input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
        </div>
        <div>
          <Label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newDateOpen}
              onChange={(e) => setNewDateOpen(e.target.checked)}
            />
            {t("open")}
          </Label>
        </div>
        <div className="flex-1">
          <Label className="mb-1">Note</Label>
          <Input
            value={newDateNote}
            onChange={(e) => setNewDateNote(e.target.value)}
          />
        </div>
        <Button onClick={addSpecialDate}>
          {t("addSpecialDate")}
        </Button>
      </div>

      <div className="space-y-2">
        {specialDates?.map((sd) => (
          <div
            key={sd._id}
            className="flex items-center justify-between border border-border p-4"
          >
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">{sd.date}</span>
              <Badge variant={sd.isOpen ? "default" : "destructive"}>
                {sd.isOpen ? t("open") : t("closed")}
              </Badge>
              {sd.note && (
                <span className="text-muted-foreground text-xs italic">
                  {sd.note}
                </span>
              )}
            </div>
            <Button
              variant="destructive"
              size="icon-xs"
              onClick={() => removeSpecial({ id: sd._id })}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
