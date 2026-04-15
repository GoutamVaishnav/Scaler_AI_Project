import { format } from "date-fns";
import { DemoModeBanner } from "@/components/demo-mode-banner";
import { BookingPageClient } from "@/components/public-booking-page";
import { getAppSnapshot } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const snapshot = await getAppSnapshot();
  const eventType = snapshot.eventTypes.find((item) => item.slug === slug);

  if (!eventType) {
    return <div className="rounded-[28px] border border-[var(--border)] bg-white/70 p-8 text-lg">Event type not found.</div>;
  }

  return (
    <div className="space-y-6">
      {snapshot.isDemoMode ? <DemoModeBanner message={snapshot.databaseError} /> : null}
      <BookingPageClient
        eventType={{
          id: eventType.id,
          title: eventType.title,
          duration: eventType.duration,
          slug: eventType.slug,
          timezone: snapshot.user.defaultTimezone,
          customQuestions: Array.isArray(eventType.customQuestions) ? (eventType.customQuestions as { id: string; label: string; required?: boolean }[]) : []
        }}
        initialDate={format(new Date(), "yyyy-MM-dd")}
      />
    </div>
  );
}
