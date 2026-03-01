"use client";

import { Button } from "@/components/ui/button";

type Props = {
  value: number;
  onChange: (count: number) => void;
};

const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

export function GuestPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {GUEST_OPTIONS.map((n) => (
        <Button
          key={n}
          variant={n === value ? "default" : "outline"}
          size="icon"
          onClick={() => onChange(n)}
        >
          {n}
        </Button>
      ))}
    </div>
  );
}
