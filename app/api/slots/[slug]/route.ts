import { set } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { getAppSnapshot } from "@/lib/db";
import { generateSlots } from "@/lib/scheduler";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");
    const timezone = searchParams.get("timezone") ?? "Asia/Kolkata";
    const meetingId = searchParams.get("meetingId") ?? undefined;

    if (!dateParam) {
      return NextResponse.json({ error: "date query parameter is required." }, { status: 400 });
    }

    const snapshot = await getAppSnapshot();
    const eventType = snapshot.eventTypes.find((item) => item.slug === slug);

    if (!eventType) {
      return NextResponse.json({ error: "Event type not found." }, { status: 404 });
    }

    const availabilities = snapshot.availabilities.filter((item) => item.userId === eventType.userId);
    const overrides = snapshot.overrides.filter(
      (item) =>
        item.userId === eventType.userId &&
        item.date.getTime() === set(new Date(dateParam), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }).getTime()
    );
    const meetings = snapshot.meetings.filter((item) => item.eventTypeId === eventType.id && item.status === "scheduled");

    const slots = generateSlots({
      date: new Date(dateParam),
      timezone,
      eventType,
      availabilities,
      overrides,
      meetings,
      excludeMeetingId: meetingId
    });

    return NextResponse.json({
      slots: slots.map((slot) => ({
        ...slot,
        startUtc: slot.startUtc.toISOString(),
        endUtc: slot.endUtc.toISOString()
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate slots." }, { status: 400 });
  }
}
