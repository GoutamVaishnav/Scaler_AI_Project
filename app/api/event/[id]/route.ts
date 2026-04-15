import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWriteUnavailableMessage, isDatabaseUnavailableError } from "@/lib/db";
import { eventTypeSchema } from "@/lib/validators";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const payload = eventTypeSchema.parse(body);
    const { id } = await params;

    const event = await prisma.eventType.update({
      where: { id },
      data: payload
    });

    return NextResponse.json(event);
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json({ error: getWriteUnavailableMessage(error) }, { status: 503 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update event." }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.eventType.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json({ error: getWriteUnavailableMessage(error) }, { status: 503 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete event." }, { status: 400 });
  }
}
