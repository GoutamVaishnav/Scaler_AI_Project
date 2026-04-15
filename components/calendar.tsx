"use client";

import { addMonths, eachDayOfInterval, endOfMonth, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export function Calendar({
  selectedDate,
  onSelectDate,
  disabledDates
}: {
  selectedDate?: Date;
  onSelectDate: (date: Date) => void;
  disabledDates?: (date: Date) => boolean;
}) {
  const [month, setMonth] = useState(selectedDate ?? new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfMonth(month);
    return eachDayOfInterval({ start, end });
  }, [month]);

  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-white/70 p-4">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setMonth(subMonths(month, 1))} className="h-10 w-10 rounded-full p-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">{format(month, "MMMM yyyy")}</h3>
        <Button variant="ghost" onClick={() => setMonth(addMonths(month, 1))} className="h-10 w-10 rounded-full p-0">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isDisabled = disabledDates?.(day) ?? false;
          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectDate(day)}
              className={cn(
                "aspect-square rounded-2xl text-sm transition",
                isSameMonth(day, month) ? "text-[var(--foreground)]" : "text-[var(--muted)]",
                selectedDate && isSameDay(day, selectedDate) ? "bg-[var(--accent)] text-white" : "bg-[var(--accent-soft)] hover:bg-[rgba(13,138,116,0.18)]",
                isDisabled && "cursor-not-allowed opacity-40"
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
