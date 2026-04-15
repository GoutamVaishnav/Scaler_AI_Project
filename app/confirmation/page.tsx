import { DemoModeBanner } from "@/components/demo-mode-banner";
import { Card, SectionHeader } from "@/components/ui";
import { getAppSnapshot } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ meetingId?: string }> }) {
  const { meetingId } = await searchParams;
  const snapshot = await getAppSnapshot();
  const meeting = meetingId ? snapshot.meetings.find((item) => item.id === meetingId) ?? null : null;

  return (
    <div className="space-y-6">
      {snapshot.isDemoMode ? <DemoModeBanner message={snapshot.databaseError} /> : null}
      <SectionHeader title="Booking Confirmed" description="Your meeting has been placed on the calendar and the host has been notified through a mock email log." />
      <Card className="space-y-3">
        {meeting ? (
          <>
            <p className="text-2xl font-semibold">{meeting.eventType.title}</p>
            <p className="text-sm text-[var(--muted)]">Booked for {meeting.name} ({meeting.email})</p>
            <p className="text-sm text-[var(--muted)]">{new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeStyle: "short" }).format(meeting.startTime)}</p>
          </>
        ) : (
          <p className="text-sm text-[var(--muted)]">Meeting details were not found, but the booking flow is complete.</p>
        )}
      </Card>
    </div>
  );
}
