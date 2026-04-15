import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DEFAULT_USER_EMAIL } from "@/lib/constants";
import { createDemoData } from "@/lib/demo-data";

export function isDatabaseUnavailableError(error: unknown) {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  const message = error instanceof Error ? error.message : String(error);
  return /can't reach database server|database connection|connect database server|econnrefused|enotfound|timeout/i.test(message);
}

export function getDatabaseErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Database connection is unavailable.";
}

export async function getDefaultUser() {
  const user = await prisma.user.findUnique({
    where: { email: DEFAULT_USER_EMAIL }
  });

  if (!user) {
    throw new Error("Default user not found. Run prisma db seed first.");
  }

  return user;
}

export async function getAppSnapshot() {
  try {
    const user = await getDefaultUser();
    const [eventTypes, availabilities, overrides, meetings] = await Promise.all([
      prisma.eventType.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" }
      }),
      prisma.availability.findMany({
        where: { userId: user.id },
        orderBy: [{ scheduleName: "asc" }, { dayOfWeek: "asc" }]
      }),
      prisma.overrideAvailability.findMany({
        where: { userId: user.id },
        orderBy: { date: "asc" }
      }),
      prisma.meeting.findMany({
        where: { eventType: { userId: user.id } },
        include: { eventType: true },
        orderBy: { startTime: "asc" }
      })
    ]);

    return {
      user,
      eventTypes,
      availabilities,
      overrides,
      meetings,
      isDemoMode: false as const,
      databaseError: null
    };
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    return createDemoData(getDatabaseErrorMessage(error));
  }
}

export function getWriteUnavailableMessage(error?: unknown) {
  const detail = error ? ` ${getDatabaseErrorMessage(error)}` : "";
  return `The database is currently unavailable, so this change could not be saved.${detail}`;
}
