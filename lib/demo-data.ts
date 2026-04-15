import { addDays, set } from "date-fns";
import { DEFAULT_USER_EMAIL } from "@/lib/constants";

const DEMO_USER_ID = "demo-user";
const EVENT_STRATEGY_ID = "demo-event-strategy";
const EVENT_INTRO_ID = "demo-event-intro";

function nextDayAt(daysFromNow: number, hours: number, minutes: number) {
  return set(addDays(new Date(), daysFromNow), {
    hours,
    minutes,
    seconds: 0,
    milliseconds: 0
  });
}

export function createDemoData(databaseError?: string) {
  const user = {
    id: DEMO_USER_ID,
    name: "Demo Host",
    email: DEFAULT_USER_EMAIL,
    defaultTimezone: "Asia/Kolkata",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z")
  };

  const eventTypes = [
    {
      id: EVENT_STRATEGY_ID,
      title: "Strategy Call",
      duration: 30,
      slug: "strategy-call",
      userId: DEMO_USER_ID,
      scheduleName: "Default",
      bufferBefore: 10,
      bufferAfter: 10,
      customQuestions: [
        {
          id: "goals",
          label: "What would you like to cover?",
          required: false,
          type: "text"
        }
      ],
      createdAt: new Date("2026-01-02T00:00:00.000Z"),
      updatedAt: new Date("2026-01-02T00:00:00.000Z")
    },
    {
      id: EVENT_INTRO_ID,
      title: "Quick Intro",
      duration: 15,
      slug: "quick-intro",
      userId: DEMO_USER_ID,
      scheduleName: "Default",
      bufferBefore: 0,
      bufferAfter: 5,
      customQuestions: [],
      createdAt: new Date("2026-01-03T00:00:00.000Z"),
      updatedAt: new Date("2026-01-03T00:00:00.000Z")
    }
  ];

  const availabilities = [
    { id: "availability-1", dayOfWeek: 1, startTime: "09:00", endTime: "17:00", timezone: "Asia/Kolkata", scheduleName: "Default", userId: DEMO_USER_ID, createdAt: new Date(), updatedAt: new Date() },
    { id: "availability-2", dayOfWeek: 2, startTime: "09:00", endTime: "17:00", timezone: "Asia/Kolkata", scheduleName: "Default", userId: DEMO_USER_ID, createdAt: new Date(), updatedAt: new Date() },
    { id: "availability-3", dayOfWeek: 3, startTime: "09:00", endTime: "17:00", timezone: "Asia/Kolkata", scheduleName: "Default", userId: DEMO_USER_ID, createdAt: new Date(), updatedAt: new Date() },
    { id: "availability-4", dayOfWeek: 4, startTime: "09:00", endTime: "17:00", timezone: "Asia/Kolkata", scheduleName: "Default", userId: DEMO_USER_ID, createdAt: new Date(), updatedAt: new Date() },
    { id: "availability-5", dayOfWeek: 5, startTime: "09:00", endTime: "15:00", timezone: "Asia/Kolkata", scheduleName: "Default", userId: DEMO_USER_ID, createdAt: new Date(), updatedAt: new Date() }
  ];

  const overrides = [
    {
      id: "override-1",
      date: nextDayAt(2, 0, 0),
      startTime: "11:00",
      endTime: "14:00",
      userId: DEMO_USER_ID,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const meetings = [
    {
      id: "meeting-1",
      eventTypeId: EVENT_STRATEGY_ID,
      name: "Aarav Patel",
      email: "aarav@example.com",
      customAnswers: { goals: "Planning a launch calendar" },
      date: nextDayAt(1, 0, 0),
      startTime: nextDayAt(1, 11, 0),
      endTime: nextDayAt(1, 11, 30),
      status: "scheduled" as const,
      bufferBefore: 10,
      bufferAfter: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
      eventType: eventTypes[0]
    },
    {
      id: "meeting-2",
      eventTypeId: EVENT_INTRO_ID,
      name: "Maya Singh",
      email: "maya@example.com",
      customAnswers: {},
      date: nextDayAt(-1, 0, 0),
      startTime: nextDayAt(-1, 16, 0),
      endTime: nextDayAt(-1, 16, 15),
      status: "cancelled" as const,
      bufferBefore: 0,
      bufferAfter: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
      eventType: eventTypes[1]
    }
  ];

  return {
    user,
    eventTypes,
    availabilities,
    overrides,
    meetings,
    isDemoMode: true as const,
    databaseError:
      databaseError ??
      "Database connection is unavailable, so ScheduleFlow is showing demo data."
  };
}
