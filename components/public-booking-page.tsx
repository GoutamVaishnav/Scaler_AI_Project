"use client";

import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { Calendar } from "@/components/calendar";
import { BookingForm } from "@/components/booking-form";
import { TimeSlots } from "@/components/time-slots";
import { Badge, Card, Input } from "@/components/ui";
import { Slot } from "@/lib/scheduler";
import { minutesToLabel } from "@/lib/utils";

export function BookingPageClient({
  eventType,
  initialDate
}: {
  eventType: {
    id: string;
    title: string;
    duration: number;
    slug: string;
    timezone: string;
    customQuestions: { id: string; label: string; required?: boolean }[];
  };
  initialDate: string;
}) {
  const [selectedDate, setSelectedDate] = useState(parseISO(initialDate));
  const [timezone, setTimezone] = useState(eventType.timezone);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    async function loadSlots() {
      const searchParams = new URLSearchParams({
        date: format(selectedDate, "yyyy-MM-dd"),
        timezone
      });
      const response = await fetch(`/api/slots/${eventType.slug}?${searchParams.toString()}`);
      const data = await response.json();
      setSlots(data.slots ?? []);
      setSelectedTime("");
    }

    loadSlots();
  }, [eventType.slug, selectedDate, timezone]);

  return (
    <div className="grid gap-5 lg:gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">Public booking page</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{eventType.title}</h1>
          <p className="text-sm leading-6 text-[var(--muted)]">Choose a date, review the available times, and finish the booking form in one flow.</p>
          <div className="flex flex-wrap gap-2">
            <Badge>{minutesToLabel(eventType.duration)}</Badge>
            <Badge>{timezone}</Badge>
          </div>
        </div>
        <label className="space-y-2 text-sm text-[var(--muted)]">
          Timezone
          <Input value={timezone} onChange={(event) => setTimezone(event.target.value)} />
        </label>
        <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </Card>

      <Card className="space-y-5">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Choose a time</h2>
          <p className="text-sm text-[var(--muted)]">{format(selectedDate, "PPP")} in {timezone}</p>
        </div>
        <TimeSlots slots={slots} selected={selectedTime} onSelect={setSelectedTime} />
        {selectedTime ? (
          <BookingForm eventTypeId={eventType.id} date={format(selectedDate, "yyyy-MM-dd")} time={selectedTime} timezone={timezone} customQuestions={eventType.customQuestions} />
        ) : (
          <p className="rounded-xl bg-white/70 px-4 py-3 text-sm text-[var(--muted)]">Pick a time to continue to the booking form.</p>
        )}
      </Card>
    </div>
  );
}
