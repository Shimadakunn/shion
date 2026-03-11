import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Moon, Sun, Trash2, Users } from "lucide-react";
import { type ServiceInput, TIME_SLOTS } from "./types";

type ServiceRowProps = {
  service: ServiceInput;
  onUpdate: (field: keyof ServiceInput, value: string | number) => void;
  onRemove: () => void;
};

function ServiceNameDisplay({ value }: { value: string }) {
  if (value === "lunch")
    return <span className="flex items-center gap-1.5"><Sun className="h-3.5 w-3.5" />Lunch</span>;
  if (value === "dinner")
    return <span className="flex items-center gap-1.5"><Moon className="h-3.5 w-3.5" />Dinner</span>;
  return <span>{value}</span>;
}

export function ServiceRow({ service, onUpdate, onRemove }: ServiceRowProps) {
  const availableCloseTimes = TIME_SLOTS.filter((t) => t > service.openTime);

  return (
    <div className="flex items-center gap-3 text-sm">
      <Select
        value={service.name}
        onValueChange={(val) => { if (val) onUpdate("name", val); }}
      >
        <SelectTrigger className="w-28">
          <SelectValue>
            {(value: string) => <ServiceNameDisplay value={value} />}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="lunch"><Sun className="inline h-3.5 w-3.5 mr-1.5" />Lunch</SelectItem>
          <SelectItem value="dinner"><Moon className="inline h-3.5 w-3.5 mr-1.5" />Dinner</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={service.openTime}
        onValueChange={(val) => { if (val) onUpdate("openTime", val); }}
      >
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TIME_SLOTS.map((t) => (
            <SelectItem key={t} value={t}>{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-muted-foreground">—</span>

      <Select
        value={service.closeTime}
        onValueChange={(val) => { if (val) onUpdate("closeTime", val); }}
      >
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableCloseTimes.map((t) => (
            <SelectItem key={t} value={t}>{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Users className="h-3.5 w-3.5 text-muted-foreground" />
      <Input
        type="number"
        value={service.maxCovers}
        onChange={(e) => onUpdate("maxCovers", Number(e.target.value))}
        className="w-16"
      />

      <Button
        variant="destructive"
        size="icon-xs"
        onClick={onRemove}
        className="ml-auto"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
