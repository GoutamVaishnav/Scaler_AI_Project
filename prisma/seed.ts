import { PrismaClient } from "@prisma/client";
import { addDays, set } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@scheduleflow.dev" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@scheduleflow.dev",
      defaultTimezone: "Asia/Kolkata"
    }
  });

  await prisma.availability.deleteMany({ where: { userId: user.id } });
  await prisma.overrideAvailability.deleteMany({ where: { userId: user.id } });
  await prisma.meeting.deleteMany();
  await prisma.eventType.deleteMany({ where: { userId: user.id } });

  const introCall = await prisma.eventType.create({
    data: {
      title: "Intro Call",
      duration: 30,
      slug: "intro-call",
      scheduleName: "Default",
      bufferBefore: 10,
      bufferAfter: 10,
      customQuestions: [
        { id: "company", label: "Company name", type: "text", required: true },
        { id: "goal", label: "What would you like to discuss?", type: "text", required: false }
      ],
      userId: user.id
    }
  });

  await prisma.eventType.create({
    data: {
      title: "Project Review",
      duration: 60,
      slug: "project-review",
      scheduleName: "Focus Hours",
      bufferBefore: 15,
      bufferAfter: 15,
      customQuestions: [{ id: "topic", label: "Main review topic", type: "text", required: true }],
      userId: user.id
    }
  });

  await prisma.availability.createMany({
    data: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "12:00", timezone: "Asia/Kolkata", scheduleName: "Default", userId: user.id },
      { dayOfWeek: 1, startTime: "13:00", endTime: "17:00", timezone: "Asia/Kolkata", scheduleName: "Default", userId: user.id },
      { dayOfWeek: 2, startTime: "10:00", endTime: "16:00", timezone: "Asia/Kolkata", scheduleName: "Default", userId: user.id },
      { dayOfWeek: 3, startTime: "09:00", endTime: "12:00", timezone: "Asia/Kolkata", scheduleName: "Default", userId: user.id },
      { dayOfWeek: 4, startTime: "12:00", endTime: "18:00", timezone: "Asia/Kolkata", scheduleName: "Default", userId: user.id },
      { dayOfWeek: 2, startTime: "18:00", endTime: "21:00", timezone: "Asia/Kolkata", scheduleName: "Focus Hours", userId: user.id },
      { dayOfWeek: 4, startTime: "18:00", endTime: "21:00", timezone: "Asia/Kolkata", scheduleName: "Focus Hours", userId: user.id }
    ]
  });

  await prisma.overrideAvailability.create({
    data: {
      date: set(addDays(new Date(), 2), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }),
      startTime: "14:00",
      endTime: "18:00",
      userId: user.id
    }
  });

  const start = set(addDays(new Date(), 1), { hours: 11, minutes: 0, seconds: 0, milliseconds: 0 });
  await prisma.meeting.create({
    data: {
      eventTypeId: introCall.id,
      name: "Alice Johnson",
      email: "alice@example.com",
      customAnswers: { company: "Acme Inc", goal: "Explore platform features" },
      date: set(start, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }),
      startTime: start,
      endTime: new Date(start.getTime() + 30 * 60 * 1000),
      bufferBefore: 10,
      bufferAfter: 10,
      status: "scheduled"
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
