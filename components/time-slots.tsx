"use client";

import { Slot } from "@/lib/scheduler";
import { Button } from "@/components/ui";

export function TimeSlots({
  slots,
  selected,
  onSelect
}: {
  slots: Slot[];
  selected?: string;
  onSelect: (value: string) => void;
}) {
  if (!slots.length) {
    return <p className="rounded-2xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">No slots available for this date.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {slots.map((slot) => (
        <Button key={slot.value} variant={selected === slot.value ? "primary" : "secondary"} onClick={() => onSelect(slot.value)} className="justify-center">
          {slot.label}
        </Button>
      ))}
    </div>
  );
}
