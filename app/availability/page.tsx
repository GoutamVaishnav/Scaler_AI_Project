import { format } from "date-fns";
import { AvailabilityForm } from "@/components/availability-form";
import { DemoModeBanner } from "@/components/demo-mode-banner";
import { Card, SectionHeader } from "@/components/ui";
import { getAppSnapshot } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
  const snapshot = await getAppSnapshot();
  const blocks = snapshot.availabilities;
  const overrides = snapshot.overrides;

  return (
    <div className="space-y-6">
      {snapshot.isDemoMode ? <DemoModeBanner message={snapshot.databaseError} /> : null}
      <SectionHeader title="Availability" description="Create multiple schedules, weekly hours, timezone-aware blocks, and date-specific overrides." />
      <Card className="bg-[linear-gradient(180deg,rgba(255,255,255,0.54),rgba(255,255,255,0.3))]">
        <AvailabilityForm
          initialBlocks={blocks.map((block) => ({
            dayOfWeek: block.dayOfWeek,
            startTime: block.startTime,
            endTime: block.endTime,
            scheduleName: block.scheduleName
          }))}
          initialOverrides={overrides.map((override) => ({
            id: override.id,
            date: format(override.date, "yyyy-MM-dd"),
            startTime: override.startTime,
            endTime: override.endTime
          }))}
          initialTimezone={blocks[0]?.timezone ?? snapshot.user.defaultTimezone}
        />
      </Card>
    </div>
  );
}
