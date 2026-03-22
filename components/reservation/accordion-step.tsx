import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  icon: React.ReactNode;
  title: string;
  summary: string;
  isOpen: boolean;
  onToggle: () => void;
  isCompleted: boolean;
  children: React.ReactNode;
};

export function AccordionStep({
  icon,
  title,
  summary,
  isOpen,
  onToggle,
  isCompleted,
  children,
}: Props) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex h-auto w-full items-center justify-between px-6 py-4"
      >
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-sm font-medium">
            {isCompleted && !isOpen ? summary : title}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "text-muted-foreground h-4 w-4 transition-transform duration-300",
            isOpen && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
