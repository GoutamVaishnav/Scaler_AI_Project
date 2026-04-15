import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { DemoModeBanner } from "@/components/demo-mode-banner";
import { getAppSnapshot, getWriteUnavailableMessage, isDatabaseUnavailableError } from "@/lib/db";
import { EventTypeForm } from "@/components/event-type-form";
import { Badge, Button, Card, SectionHeader } from "@/components/ui";
import { minutesToLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function deleteEventType(formData: FormData) {
  "use server";

  const id = formData.get("id");
  if (typeof id !== "string") return;

  try {
    await prisma.eventType.delete({ where: { id } });
    revalidatePath("/event");
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      throw new Error(getWriteUnavailableMessage(error));
    }

    throw error;
  }
}

export default async function EventPage() {
  const snapshot = await getAppSnapshot();
  const eventTypes = snapshot.eventTypes;

  return (
    <div className="space-y-6">
      {snapshot.isDemoMode ? <DemoModeBanner message={snapshot.databaseError} /> : null}
      <Card className="border-[rgba(17,124,112,0.2)] bg-[linear-gradient(135deg,rgba(17,124,112,0.32),rgba(255,255,255,0.78)_42%,rgba(232,138,95,0.22))] shadow-[var(--shadow)]">
        <SectionHeader title="Event Types" description="Create public booking links with durations, buffers, schedules, and custom invitee questions." />
      </Card>
      <Card className="space-y-4 border-[rgba(17,124,112,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(255,255,255,0.32))]">
        <div className="space-y-2">
          <div className="inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-strong)]">
            New event
          </div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Create a new event</h2>
          <p className="text-sm leading-6 text-[var(--muted)]">Set a title, duration, and booking link details. You can also add buffers and invitee questions.</p>
        </div>
        <EventTypeForm />
      </Card>
      <div className="grid gap-4">
        {eventTypes.map((eventType) => (
          <Card key={eventType.id} className="space-y-5 border-[rgba(17,124,112,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.6),rgba(255,255,255,0.38))]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{eventType.title}</h2>
                  <Badge>{minutesToLabel(eventType.duration)}</Badge>
                  <Badge>{eventType.scheduleName ?? "Default"}</Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl border border-[var(--border)] bg-white/72 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Slug</p>
                    <p className="mt-2 break-all text-sm font-medium text-[var(--foreground)]">{eventType.slug}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-white/72 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Before buffer</p>
                    <p className="mt-2 text-sm font-medium text-[var(--foreground)]">{eventType.bufferBefore} min</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-white/72 px-4 py-3 sm:col-span-2 lg:col-span-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">After buffer</p>
                    <p className="mt-2 text-sm font-medium text-[var(--foreground)]">{eventType.bufferAfter} min</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row xl:min-w-44 xl:flex-col">
                <Link href={`/book/${eventType.slug}`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] px-4 py-3 text-sm font-medium text-[var(--accent-strong)] transition hover:bg-[rgba(17,124,112,0.18)]">
                  Open link
                </Link>
                <form action={deleteEventType} className="w-full">
                  <input type="hidden" name="id" value={eventType.id} />
                  <Button type="submit" variant="ghost" className="w-full border border-[rgba(29,39,56,0.08)] bg-white/70">
                    Delete
                  </Button>
                </form>
              </div>
            </div>
            <div className="rounded-[22px] border border-[var(--border)] bg-white/60 p-3 sm:p-4">
              <div className="mb-4 space-y-1">
                <h3 className="text-base font-semibold tracking-tight">Edit event details</h3>
                <p className="text-sm text-[var(--muted)]">Update title, slug, duration, buffers, or invitee questions.</p>
              </div>
              <EventTypeForm
                initialData={{
                  id: eventType.id,
                  title: eventType.title,
                  duration: eventType.duration,
                  slug: eventType.slug,
                  scheduleName: eventType.scheduleName,
                  bufferBefore: eventType.bufferBefore,
                  bufferAfter: eventType.bufferAfter,
                  customQuestions: Array.isArray(eventType.customQuestions) ? (eventType.customQuestions as { id: string; label: string; required?: boolean }[]) : []
                }}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
