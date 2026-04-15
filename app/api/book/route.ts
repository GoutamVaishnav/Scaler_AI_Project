import { addMinutes, parseISO, set } from "date-fns";
import { NextResponse } from "next/server";
import { getAppSnapshot, getWriteUnavailableMessage, isDatabaseUnavailableError } from "@/lib/db";
import { sendBookingConfirmationEmails } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validators";
import { generateSlots } from "@/lib/scheduler";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = bookingSchema.parse(body);
    const snapshot = await getAppSnapshot();

    if (snapshot.isDemoMode) {
      return NextResponse.json({ error: getWriteUnavailableMessage(snapshot.databaseError) }, { status: 503 });
    }

    const eventType = await prisma.eventType.findUnique({
      where: { id: payload.eventTypeId },
      include: { user: true }
    });

    if (!eventType) {
      return NextResponse.json({ error: "Event type not found." }, { status: 404 });
    }

    const [availabilities, overrides, meetings] = await Promise.all([
      prisma.availability.findMany({ where: { userId: eventType.userId } }),
      prisma.overrideAvailability.findMany({
        where: {
          userId: eventType.userId,
          date: set(parseISO(payload.date), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })
        }
      }),
      prisma.meeting.findMany({
        where: {
          eventType: { userId: eventType.userId },
          status: "scheduled"
        }
      })
    ]);

    const slots = generateSlots({
      date: parseISO(payload.date),
      timezone: payload.timezone,
      eventType,
      availabilities,
      overrides,
      meetings
    });

    const chosenSlot = slots.find((slot) => slot.value === payload.time);
    if (!chosenSlot) {
      return NextResponse.json({ error: "This slot is no longer available." }, { status: 409 });
    }

    const meeting = await prisma.meeting.create({
      data: {
        eventTypeId: eventType.id,
        name: payload.name,
        email: payload.email,
        customAnswers: payload.customAnswers,
        date: set(chosenSlot.startUtc, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }),
        startTime: chosenSlot.startUtc,
        endTime: addMinutes(chosenSlot.startUtc, eventType.duration),
        bufferBefore: eventType.bufferBefore,
        bufferAfter: eventType.bufferAfter,
        status: "scheduled"
      }
    });

    await sendBookingConfirmationEmails({
      hostEmail: eventType.user.email,
      inviteeEmail: payload.email,
      inviteeName: payload.name,
      eventTitle: eventType.title,
      startTime: meeting.startTime
    });

    return NextResponse.json({ meeting }, { status: 201 });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json({ error: getWriteUnavailableMessage(error) }, { status: 503 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to book meeting." }, { status: 400 });
  }
}
