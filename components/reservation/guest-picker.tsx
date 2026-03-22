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
          type="button"
          onClick={() => onChange(n)}
          className={cn(
            "flex size-11 items-center justify-center rounded-lg border text-sm font-semibold transition-colors",
            n === value
              ? "border-foreground bg-foreground text-background"
              : "border-border",
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
