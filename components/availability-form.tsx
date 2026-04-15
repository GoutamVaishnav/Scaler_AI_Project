"use client";

import { useState, useTransition } from "react";
import { Button, Card, Input, Select } from "@/components/ui";
import { TIMEZONES, WEEK_DAYS } from "@/lib/constants";
import { useToast } from "@/components/toast";

type AvailabilityBlock = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  scheduleName: string;
};

type OverrideBlock = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
};

export function AvailabilityForm({
  initialBlocks,
  initialOverrides
}: {
  initialBlocks: AvailabilityBlock[];
  initialOverrides: OverrideBlock[];
}) {
  const { pushToast } = useToast();
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>(initialBlocks.length ? initialBlocks : [{ dayOfWeek: 1, startTime: "09:00", endTime: "17:00", scheduleName: "Default" }]);
  const [overrides, setOverrides] = useState(initialOverrides);
  const [overrideDate, setOverrideDate] = useState("");
  const [overrideStart, setOverrideStart] = useState("10:00");
  const [overrideEnd, setOverrideEnd] = useState("15:00");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <Select value={timezone} onChange={(event) => setTimezone(event.target.value)}>
            {TIMEZONES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Button type="button" variant="secondary" className="w-full lg:w-fit" onClick={() => setBlocks((current) => [...current, { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", scheduleName: "Default" }])}>
            Add weekly block
          </Button>
        </div>

        <div className="space-y-3">
          {blocks.map((block, index) => (
            <div key={`${block.scheduleName}-${index}`} className="grid gap-3 rounded-2xl border border-[var(--border)] bg-white/80 p-4 lg:grid-cols-4">
              <Select value={String(block.dayOfWeek)} onChange={(event) => setBlocks((current) => current.map((item, currentIndex) => (currentIndex === index ? { ...item, dayOfWeek: Number(event.target.value) } : item)))}>
                {WEEK_DAYS.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </Select>
              <Input type="time" value={block.startTime} onChange={(event) => setBlocks((current) => current.map((item, currentIndex) => (currentIndex === index ? { ...item, startTime: event.target.value } : item)))} />
              <Input type="time" value={block.endTime} onChange={(event) => setBlocks((current) => current.map((item, currentIndex) => (currentIndex === index ? { ...item, endTime: event.target.value } : item)))} />
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input placeholder="Schedule name" value={block.scheduleName} onChange={(event) => setBlocks((current) => current.map((item, currentIndex) => (currentIndex === index ? { ...item, scheduleName: event.target.value } : item)))} />
                <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => setBlocks((current) => current.filter((_, currentIndex) => currentIndex !== index))}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          disabled={isPending}
          className="w-full sm:w-auto"
          onClick={() =>
            startTransition(async () => {
              const response = await fetch("/api/availability", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ timezone, blocks })
              });

              const data = await response.json();
              if (!response.ok) {
                pushToast(data.error ?? "Unable to save availability.", "error");
                return;
              }

              pushToast("Availability saved.");
            })
          }
        >
          {isPending ? "Saving..." : "Save availability"}
        </Button>
      </Card>

      <Card className="space-y-4">
        <h3 className="text-2xl font-semibold">Date-specific overrides</h3>
        <div className="grid gap-3 lg:grid-cols-4">
          <Input type="date" value={overrideDate} onChange={(event) => setOverrideDate(event.target.value)} />
          <Input type="time" value={overrideStart} onChange={(event) => setOverrideStart(event.target.value)} />
          <Input type="time" value={overrideEnd} onChange={(event) => setOverrideEnd(event.target.value)} />
          <Button
            type="button"
            variant="secondary"
            className="w-full lg:w-auto"
            onClick={() =>
              startTransition(async () => {
                const response = await fetch("/api/availability/override", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ date: overrideDate, startTime: overrideStart, endTime: overrideEnd })
                });

                const data = await response.json();
                if (!response.ok) {
                  pushToast(data.error ?? "Unable to save override.", "error");
                  return;
                }

                setOverrides((current) => [...current, data.override]);
                setOverrideDate("");
                pushToast("Override saved.");
              })
            }
          >
            Add override
          </Button>
        </div>
        <div className="grid gap-3">
          {overrides.map((override) => (
            <div key={override.id} className="rounded-2xl border border-[var(--border)] bg-white/80 p-4 text-sm">
              {override.date}: {override.startTime} - {override.endTime}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
