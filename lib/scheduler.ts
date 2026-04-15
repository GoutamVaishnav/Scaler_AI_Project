import { Availability, EventType, Meeting, MeetingStatus, OverrideAvailability } from "@prisma/client";
import { addMinutes, format, isBefore, set } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

type AvailabilityLike = Pick<Availability, "dayOfWeek" | "startTime" | "endTime" | "timezone" | "scheduleName">;
type OverrideLike = Pick<OverrideAvailability, "date" | "startTime" | "endTime">;
type MeetingLike = Pick<Meeting, "id" | "startTime" | "endTime" | "status" | "bufferBefore" | "bufferAfter">;
type EventTypeLike = Pick<EventType, "duration" | "bufferBefore" | "bufferAfter" | "scheduleName">;

export type Slot = {
  label: string;
  value: string;
  startUtc: Date;
  endUtc: Date;
};

function parseTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return { hours, minutes };
}

function combineLocalDateTime(date: Date, time: string, timezone: string) {
  const zonedDate = toZonedTime(date, timezone);
  const { hours, minutes } = parseTime(time);
  const localDate = set(zonedDate, { hours, minutes, seconds: 0, milliseconds: 0 });
  return fromZonedTime(localDate, timezone);
}

function isSameLocalDay(a: Date, b: Date, timezone: string) {
  return format(toZonedTime(a, timezone), "yyyy-MM-dd") === format(toZonedTime(b, timezone), "yyyy-MM-dd");
}

function overlapsWithBuffers(start: Date, end: Date, meeting: MeetingLike) {
  if (meeting.status === MeetingStatus.cancelled) {
    return false;
  }

  const blockedStart = addMinutes(meeting.startTime, -meeting.bufferBefore);
  const blockedEnd = addMinutes(meeting.endTime, meeting.bufferAfter);

  return start < blockedEnd && end > blockedStart;
}

export function resolveAvailabilityWindows(args: {
  date: Date;
  timezone: string;
  scheduleName?: string | null;
  availabilities: AvailabilityLike[];
  overrides: OverrideLike[];
}) {
  const { date, timezone, scheduleName, availabilities, overrides } = args;
  const overrideBlocks = overrides.filter((item) => isSameLocalDay(item.date, date, timezone));

  if (overrideBlocks.length > 0) {
    return overrideBlocks.map((item) => ({
      startUtc: combineLocalDateTime(date, item.startTime, timezone),
      endUtc: combineLocalDateTime(date, item.endTime, timezone)
    }));
  }

  const localDate = toZonedTime(date, timezone);
  const dayOfWeek = localDate.getDay();
  const weeklyBlocks = availabilities.filter((item) => {
    if (item.dayOfWeek !== dayOfWeek) return false;
    if (!scheduleName) return true;
    return item.scheduleName === scheduleName;
  });

  return weeklyBlocks.map((item) => ({
    startUtc: combineLocalDateTime(date, item.startTime, item.timezone),
    endUtc: combineLocalDateTime(date, item.endTime, item.timezone)
  }));
}

export function generateSlots(args: {
  date: Date;
  timezone: string;
  eventType: EventTypeLike;
  availabilities: AvailabilityLike[];
  overrides: OverrideLike[];
  meetings: MeetingLike[];
  excludeMeetingId?: string;
}) {
  const { date, timezone, eventType, availabilities, overrides, meetings, excludeMeetingId } = args;
  const windows = resolveAvailabilityWindows({
    date,
    timezone,
    scheduleName: eventType.scheduleName,
    availabilities,
    overrides
  });

  const now = new Date();
  const slots: Slot[] = [];

  for (const window of windows) {
    let current = new Date(window.startUtc);

    while (addMinutes(current, eventType.duration) <= window.endUtc) {
      const startUtc = new Date(current);
      const endUtc = addMinutes(startUtc, eventType.duration);

      const hasConflict = meetings.some((meeting) => {
        if (excludeMeetingId && meeting.id === excludeMeetingId) return false;
        return overlapsWithBuffers(startUtc, endUtc, meeting);
      });

      if (!hasConflict && !isBefore(startUtc, now)) {
        slots.push({
          label: format(toZonedTime(startUtc, timezone), "hh:mm a"),
          value: format(toZonedTime(startUtc, timezone), "HH:mm"),
          startUtc,
          endUtc
        });
      }

      current = addMinutes(current, eventType.duration);
    }
  }

  return slots;
}
