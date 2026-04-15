import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppSnapshot, getDefaultUser, getWriteUnavailableMessage, isDatabaseUnavailableError } from "@/lib/db";
import { availabilityPayloadSchema } from "@/lib/validators";

export async function GET() {
  const snapshot = await getAppSnapshot();
  return NextResponse.json(snapshot.availabilities);
}

export async function POST(request: Request) {
  try {
    const user = await getDefaultUser();
    const body = await request.json();
    const payload = availabilityPayloadSchema.parse(body);

    await prisma.$transaction([
      prisma.availability.deleteMany({ where: { userId: user.id } }),
      prisma.availability.createMany({
        data: payload.blocks.map((block) => ({
          ...block,
          timezone: payload.timezone,
          userId: user.id
        }))
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json({ error: getWriteUnavailableMessage(error) }, { status: 503 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save availability." }, { status: 400 });
  }
}
