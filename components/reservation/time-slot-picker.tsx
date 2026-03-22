"use client";

import { cn } from "@/lib/utils";

type ServiceSlots = {
  name: string;
  openTime: string;
  closeTime: string;
  slots: { time: string; available: boolean }[];
};

type Props = {
  services: ServiceSlots[];
  value: { service: string; time: string } | null;
  onChange: (selection: { service: string; time: string }) => void;
};

export function TimeSlotPicker({ services, value, onChange }: Props) {
  return (
    <div className="space-y-8">
      {services.map((svc) => (
        <div key={svc.name}>
          <h4 className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
            {svc.name} ({svc.openTime} — {svc.closeTime})
          </h4>
          <div className="flex flex-wrap gap-2">
            {svc.slots.map((slot) => {
              const isSelected =
                value?.service === svc.name && value?.time === slot.time;

              return (
                <button
                  key={`${svc.name}-${slot.time}`}
                  type="button"
                  disabled={!slot.available}
                  onClick={() =>
                    onChange({ service: svc.name, time: slot.time })
                  }
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    !slot.available
                      ? "pointer-events-none opacity-30 line-through"
                      : isSelected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border",
                  )}
                >
                  {slot.time}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
