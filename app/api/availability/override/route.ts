import { parseISO, set } from "date-fns";
import { NextResponse } from "next/server";
import { getDefaultUser, getWriteUnavailableMessage, isDatabaseUnavailableError } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { overrideAvailabilitySchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const user = await getDefaultUser();
    const body = await request.json();
    const payload = overrideAvailabilitySchema.parse(body);
    const rawDate = parseISO(payload.date);
    const date = set(rawDate, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });

    const override = await prisma.overrideAvailability.create({
      data: {
        date,
        startTime: payload.startTime,
        endTime: payload.endTime,
        userId: user.id
      }
    });

    return NextResponse.json({
      override: {
        id: override.id,
        date: payload.date,
        startTime: override.startTime,
        endTime: override.endTime
      }
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json({ error: getWriteUnavailableMessage(error) }, { status: 503 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save override." }, { status: 400 });
  }
}
