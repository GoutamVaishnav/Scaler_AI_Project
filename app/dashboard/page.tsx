import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  Clock3,
  Layers3,
  Sparkles
} from "lucide-react";
import { DemoModeBanner } from "@/components/demo-mode-banner";
import { getAppSnapshot } from "@/lib/db";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { minutesToLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statCards = [
  {
    key: "events",
    label: "Event types",
    icon: Layers3,
    tone: "bg-white/14 text-white"
  },
  {
    key: "blocks",
    label: "Weekly blocks",
    icon: Clock3,
    tone: "bg-white/14 text-white"
  },
  {
    key: "meetings",
    label: "Upcoming meetings",
    icon: CalendarClock,
    tone: "bg-white/14 text-white"
  }
] as const;

export default async function DashboardPage() {
  const snapshot = await getAppSnapshot();
  const eventTypes = snapshot.eventTypes;
  const meetings = snapshot.meetings.filter((meeting) => meeting.status === "scheduled").slice(0, 5);
  const availabilityCount = snapshot.availabilities.length;

  const nextMeeting = meetings[0] ?? null;

  const stats = {
    events: eventTypes.length,
    blocks: availabilityCount,
    meetings: meetings.length
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {snapshot.isDemoMode ? <DemoModeBanner message={snapshot.databaseError} /> : null}
      <div className="rounded-[28px] border border-[rgba(29,39,56,0.08)] bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(255,255,255,0.5)_45%,rgba(17,124,112,0.08))] p-5 shadow-[var(--shadow)] sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Command Center
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-[#0f172a] sm:text-4xl">
                Schedule smarter with one modern control panel.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
                Manage booking links, weekly availability, and upcoming meetings with a cleaner view that works smoothly across mobile, tablet, and desktop.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.22fr_0.78fr]">
        <Card className="overflow-hidden border-[rgba(17,124,112,0.18)] bg-[linear-gradient(135deg,#0f6b60,#117c70_52%,#1d2738)] text-white">
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-sm ring-1 ring-white/10">
                <Sparkles className="h-3.5 w-3.5" />
                Modern scheduling workspace
              </div>

              <div className="space-y-3">
                <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                  A faster way to manage your availability and bookings.
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-white/78 sm:text-base">
                  Create event types, share links, and keep your upcoming schedule visible without jumping across multiple screens.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/event"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#111827] px-4 py-2.5 text-sm font-medium text-white shadow-[0_12px_28px_rgba(17,24,39,0.2)] transition hover:bg-black"
                >
                  Create event type
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/availability"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/14"
                >
                  Update availability
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {statCards.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="rounded-2xl border border-white/10 bg-white/8 p-4 shadow-sm backdrop-blur-sm">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.tone}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">{item.label}</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{stats[item.key]}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <Card className="space-y-4 border-[rgba(17,124,112,0.18)] bg-[linear-gradient(180deg,#1d2738,#23324a)] text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/68">Next up</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">Upcoming spotlight</h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-white">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
          </div>

          {nextMeeting ? (
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/8 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-semibold tracking-tight text-white">{nextMeeting.eventType.title}</p>
                  <p className="mt-1 text-sm text-white/72">{nextMeeting.name} • {nextMeeting.email}</p>
                </div>
                <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                  Live
                </span>
              </div>

              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/68">Scheduled for</p>
                <p className="mt-1 text-sm leading-6 text-white">
                  {new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeStyle: "short" }).format(nextMeeting.startTime)}
                </p>
              </div>

              <Link href="/meetings" className="inline-flex items-center gap-2 text-sm font-medium text-white">
                Open meetings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/14 bg-white/8 p-4 text-sm leading-6 text-white/72">
              No upcoming meetings yet. Once someone books a slot, your next meeting will appear here.
            </div>
          )}
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.06fr_0.94fr]">
        <Card className="space-y-4 bg-[linear-gradient(180deg,rgba(255,255,255,0.68),rgba(255,255,255,0.4))]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Event links</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Shareable event types people can book instantly.</p>
            </div>
            <Link href="/event" className="text-sm font-medium text-[var(--accent-strong)]">
              Manage all
            </Link>
          </div>

          <div className="grid gap-3">
            {eventTypes.length ? (
              eventTypes.map((eventType) => (
                <div key={eventType.id} className="rounded-2xl border border-[var(--border)] bg-white/88 p-4 shadow-sm transition hover:shadow-md">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-base font-semibold sm:text-lg">{eventType.title}</p>
                      <p className="mt-1 break-all text-sm text-[var(--muted)]">/{eventType.slug}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{minutesToLabel(eventType.duration)}</Badge>
                      <Badge>{eventType.scheduleName ?? "Default"}</Badge>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-[var(--muted)]">
                      Buffer: {eventType.bufferBefore} min before • {eventType.bufferAfter} min after
                    </p>
                    <Link
                      href={`/book/${eventType.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent-strong)]"
                    >
                      Open booking page
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white/75 p-4 text-sm leading-6 text-[var(--muted)]">
                No event types yet. Create one to generate your first booking link.
              </div>
            )}
          </div>
        </Card>

        <Card className="space-y-4 bg-[linear-gradient(180deg,rgba(255,255,255,0.68),rgba(255,255,255,0.4))]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Recent schedule</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Your latest scheduled meetings at a glance.</p>
            </div>
            <Link href="/meetings" className="text-sm font-medium text-[var(--accent-strong)]">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {meetings.length ? (
              meetings.map((meeting) => (
                <div key={meeting.id} className="rounded-2xl border border-[var(--border)] bg-white/88 p-4 shadow-sm transition hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{meeting.eventType.title}</p>
                    <div className="rounded-full bg-[rgba(17,124,112,0.1)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-strong)]">
                      Scheduled
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">{meeting.name} • {meeting.email}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(meeting.startTime)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white/75 p-4 text-sm leading-6 text-[var(--muted)]">
                No meetings scheduled yet. Once bookings start coming in, they will appear here.
              </div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
