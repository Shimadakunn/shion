"use client";

import { Button } from "@/components/ui/button";

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
                <Button
                  key={`${svc.name}-${slot.time}`}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  disabled={!slot.available}
                  onClick={() =>
                    onChange({ service: svc.name, time: slot.time })
                  }
                  className={!slot.available ? "line-through" : ""}
                >
                  {slot.time}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
