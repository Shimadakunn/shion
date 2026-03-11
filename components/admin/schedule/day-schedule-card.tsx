import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { type ServiceInput, DAY_LABELS } from "./types";
import { ServiceRow } from "./service-row";

type DayScheduleCardProps = {
  day: number;
  isOpen: boolean;
  services: ServiceInput[];
  onAddService: () => void;
  onUpdateService: (index: number, field: keyof ServiceInput, value: string | number) => void;
  onRemoveService: (index: number) => void;
};

export function DayScheduleCard({
  day,
  isOpen,
  services,
  onAddService,
  onUpdateService,
  onRemoveService,
}: DayScheduleCardProps) {
  return (
    <div className="border border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="w-24 text-sm font-medium">{DAY_LABELS[day]}</span>
          <Badge
            className={
              isOpen
                ? "bg-green-600/15 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                : "bg-red-600/15 text-red-700 dark:bg-red-500/20 dark:text-red-400"
            }
          >
            {isOpen ? "Open" : "Closed"}
          </Badge>
        </div>
        <Button variant="ghost" size="icon-xs" onClick={onAddService}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {isOpen && services.length > 0 && (
        <div className="mt-3 space-y-2">
          {services.map((svc, i) => (
            <ServiceRow
              key={i}
              service={svc}
              onUpdate={(field, value) => onUpdateService(i, field, value)}
              onRemove={() => onRemoveService(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
