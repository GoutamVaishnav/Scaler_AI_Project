"use client";

import { format } from "date-fns";
import { useEffect, useState, useTransition } from "react";
import { Calendar } from "@/components/calendar";
import { Modal } from "@/components/modal";
import { TimeSlots } from "@/components/time-slots";
import { Badge, Button, Card, Input } from "@/components/ui";
import { useToast } from "@/components/toast";
import { Slot } from "@/lib/scheduler";

type MeetingItem = {
  id: string;
  name: string;
  email: string;
  status: "scheduled" | "cancelled";
  startLabel: string;
  eventTitle: string;
  eventSlug: string;
};

export function MeetingList({ upcoming, past }: { upcoming: MeetingItem[]; past: MeetingItem[] }) {
  const { pushToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingItem | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [time, setTime] = useState("");

  useEffect(() => {
    async function loadSlots() {
      if (!selectedMeeting) return;

      const searchParams = new URLSearchParams({
        date: format(date, "yyyy-MM-dd"),
        timezone,
        meetingId: selectedMeeting.id
      });
      const response = await fetch(`/api/slots/${selectedMeeting.eventSlug}?${searchParams.toString()}`);
      const data = await response.json();
      setSlots(data.slots ?? []);
    }

    loadSlots();
  }, [date, selectedMeeting, timezone]);

  const updateMeeting = async (meetingId: string, payload: Record<string, string>) => {
    const response = await fetch(`/api/meetings/${meetingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      pushToast(data.error ?? "Unable to update meeting.", "error");
      return false;
    }

    pushToast("Meeting updated.");
    window.location.reload();
    return true;
  };

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Upcoming meetings</h2>
            <Badge>{upcoming.length}</Badge>
          </div>
          <div className="space-y-3">
            {upcoming.map((meeting) => (
              <div key={meeting.id} className="rounded-2xl border border-[var(--border)] bg-white/85 p-4 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-semibold tracking-tight">{meeting.eventTitle}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{meeting.name} - {meeting.email}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{format(new Date(meeting.startLabel), "PPP p")}</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      variant="secondary"
                      className="w-full sm:min-w-32"
                      onClick={() => {
                        setSelectedMeeting(meeting);
                        setTime("");
                      }}
                    >
                      Reschedule
                    </Button>
                    <Button
                      variant="danger"
                      disabled={isPending}
                      className="w-full sm:min-w-32"
                      onClick={() =>
                        startTransition(async () => {
                          await updateMeeting(meeting.id, { action: "cancel" });
                        })
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {!upcoming.length && <p className="text-sm text-[var(--muted)]">No upcoming meetings.</p>}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Past meetings</h2>
            <Badge>{past.length}</Badge>
          </div>
          <div className="space-y-3">
            {past.map((meeting) => (
              <div key={meeting.id} className="rounded-2xl border border-[var(--border)] bg-white/85 p-4 shadow-sm">
                <p className="text-lg font-semibold tracking-tight">{meeting.eventTitle}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{meeting.name} - {meeting.email}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{format(new Date(meeting.startLabel), "PPP p")}</p>
              </div>
            ))}
            {!past.length && <p className="text-sm text-[var(--muted)]">No past meetings yet.</p>}
          </div>
        </Card>
      </div>

      <Modal open={Boolean(selectedMeeting)} title="Reschedule meeting" onClose={() => setSelectedMeeting(null)}>
        <div className="space-y-4">
          <Input value={timezone} onChange={(event) => setTimezone(event.target.value)} placeholder="Timezone" />
          <Calendar selectedDate={date} onSelectDate={setDate} />
          <TimeSlots slots={slots} selected={time} onSelect={setTime} />
          <Button
            disabled={!selectedMeeting || !time}
            onClick={async () => {
              if (!selectedMeeting) return;
              const success = await updateMeeting(selectedMeeting.id, {
                action: "reschedule",
                date: format(date, "yyyy-MM-dd"),
                time,
                timezone
              });

              if (success) setSelectedMeeting(null);
            }}
            className="w-full"
          >
            Save new time
          </Button>
        </div>
      </Modal>
    </>
  );
}
