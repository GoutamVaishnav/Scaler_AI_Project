import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppSnapshot, getDefaultUser, getWriteUnavailableMessage, isDatabaseUnavailableError } from "@/lib/db";
import { eventTypeSchema } from "@/lib/validators";

export async function GET() {
  const snapshot = await getAppSnapshot();
  return NextResponse.json(snapshot.eventTypes);
}

export async function POST(request: Request) {
  try {
    const user = await getDefaultUser();
    const body = await request.json();
    const payload = eventTypeSchema.parse(body);

    const event = await prisma.eventType.create({
      data: {
        ...payload,
        userId: user.id
      }
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json({ error: getWriteUnavailableMessage(error) }, { status: 503 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid event payload." }, { status: 400 });
  }
}
