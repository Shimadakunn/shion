"use client";

import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange: (count: number) => void;
};

const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

export function GuestPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {GUEST_OPTIONS.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={cn(
            "flex h-12 w-12 items-center justify-center text-sm font-medium transition-colors",
            n === value
              ? "bg-foreground text-background"
              : "border border-border text-muted-foreground hover:border-foreground hover:text-foreground",
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
