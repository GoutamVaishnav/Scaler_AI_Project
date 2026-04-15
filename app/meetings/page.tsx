import { isAfter } from "date-fns";
import { DemoModeBanner } from "@/components/demo-mode-banner";
import { MeetingList } from "@/components/meeting-list";
import { Card, SectionHeader } from "@/components/ui";
import { getAppSnapshot } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  const snapshot = await getAppSnapshot();
  const meetings = snapshot.meetings;

  const now = new Date();
  const upcoming = meetings.filter((meeting) => meeting.status === "scheduled" && isAfter(meeting.startTime, now));
  const past = meetings.filter((meeting) => !isAfter(meeting.startTime, now) || meeting.status === "cancelled");

  return (
    <div className="space-y-6">
      {snapshot.isDemoMode ? <DemoModeBanner message={snapshot.databaseError} /> : null}
      <SectionHeader title="Meetings" description="Track upcoming and past meetings, cancel them instantly, and reschedule without double bookings." />
      <Card className="bg-[linear-gradient(180deg,rgba(255,255,255,0.54),rgba(255,255,255,0.3))]">
        <MeetingList
          upcoming={upcoming.map((meeting) => ({
            id: meeting.id,
            name: meeting.name,
            email: meeting.email,
            status: meeting.status,
            startLabel: meeting.startTime.toISOString(),
            eventTitle: meeting.eventType.title,
            eventSlug: meeting.eventType.slug
          }))}
          past={past.map((meeting) => ({
            id: meeting.id,
            name: meeting.name,
            email: meeting.email,
            status: meeting.status,
            startLabel: meeting.startTime.toISOString(),
            eventTitle: meeting.eventType.title,
            eventSlug: meeting.eventType.slug
          }))}
        />
      </Card>
    </div>
  );
}
