import { addMinutes, parseISO, set } from "date-fns";
import { NextResponse } from "next/server";
import { getAppSnapshot, getWriteUnavailableMessage, isDatabaseUnavailableError } from "@/lib/db";
import { sendCancellationEmails, sendRescheduleEmails } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { meetingUpdateSchema } from "@/lib/validators";
import { generateSlots } from "@/lib/scheduler";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const payload = meetingUpdateSchema.parse(body);
    const { id } = await params;
    const snapshot = await getAppSnapshot();

    if (snapshot.isDemoMode) {
      return NextResponse.json({ error: getWriteUnavailableMessage(snapshot.databaseError) }, { status: 503 });
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: { eventType: { include: { user: true } } }
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
    }

    if (payload.action === "cancel") {
      const updated = await prisma.meeting.update({
        where: { id },
        data: { status: "cancelled" }
      });

      await sendCancellationEmails({
        hostEmail: meeting.eventType.user.email,
        inviteeEmail: updated.email,
        inviteeName: updated.name,
        eventTitle: meeting.eventType.title,
        startTime: updated.startTime
      });

      return NextResponse.json(updated);
    }

    if (!payload.date || !payload.time || !payload.timezone) {
      return NextResponse.json({ error: "date, time, and timezone are required for reschedule." }, { status: 400 });
    }

    const [availabilities, overrides, meetings] = await Promise.all([
      prisma.availability.findMany({ where: { userId: meeting.eventType.userId } }),
      prisma.overrideAvailability.findMany({
        where: {
          userId: meeting.eventType.userId,
          date: set(parseISO(payload.date), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })
        }
      }),
      prisma.meeting.findMany({
        where: {
          eventType: { userId: meeting.eventType.userId },
          status: "scheduled"
        }
      })
    ]);

    const slots = generateSlots({
      date: parseISO(payload.date),
      timezone: payload.timezone,
      eventType: meeting.eventType,
      availabilities,
      overrides,
      meetings,
      excludeMeetingId: meeting.id
    });

    const chosenSlot = slots.find((slot) => slot.value === payload.time);
    if (!chosenSlot) {
      return NextResponse.json({ error: "Selected slot is not available anymore." }, { status: 409 });
    }

    const updated = await prisma.meeting.update({
      where: { id: meeting.id },
      data: {
        date: set(chosenSlot.startUtc, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }),
        startTime: chosenSlot.startUtc,
        endTime: addMinutes(chosenSlot.startUtc, meeting.eventType.duration),
        status: "scheduled"
      }
    });

    await sendRescheduleEmails({
      hostEmail: meeting.eventType.user.email,
      inviteeEmail: updated.email,
      inviteeName: updated.name,
      eventTitle: meeting.eventType.title,
      previousStartTime: meeting.startTime,
      startTime: updated.startTime
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json({ error: getWriteUnavailableMessage(error) }, { status: 503 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update meeting." }, { status: 400 });
  }
}
