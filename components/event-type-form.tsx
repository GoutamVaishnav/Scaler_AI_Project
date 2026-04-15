"use client";

import { useState, useTransition } from "react";
import { Button, Card, Input, Select } from "@/components/ui";
import { useToast } from "@/components/toast";
import { minutesToLabel } from "@/lib/utils";

type EventTypeFormProps = {
  initialData?: {
    id: string;
    title: string;
    duration: number;
    slug: string;
    scheduleName: string | null;
    bufferBefore: number;
    bufferAfter: number;
    customQuestions: { id: string; label: string; required?: boolean }[];
  };
  onSaved?: () => void;
};

export function EventTypeForm({ initialData, onSaved }: EventTypeFormProps) {
  const { pushToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [duration, setDuration] = useState(initialData?.duration ?? 30);
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [scheduleName, setScheduleName] = useState(initialData?.scheduleName ?? "Default");
  const [bufferBefore, setBufferBefore] = useState(initialData?.bufferBefore ?? 0);
  const [bufferAfter, setBufferAfter] = useState(initialData?.bufferAfter ?? 0);
  const [questionLabel, setQuestionLabel] = useState("");
  const [questions, setQuestions] = useState(initialData?.customQuestions ?? []);

  const submit = () => {
    startTransition(async () => {
      const payload = {
        title,
        duration,
        slug,
        scheduleName,
        bufferBefore,
        bufferAfter,
        customQuestions: questions.map((question) => ({ ...question, type: "text" }))
      };

      const response = await fetch(initialData ? `/api/event/${initialData.id}` : "/api/event", {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        pushToast(data.error ?? "Unable to save event type.", "error");
        return;
      }

      pushToast(initialData ? "Event type updated." : "Event type created.");
      onSaved?.();

      if (!initialData) {
        setTitle("");
        setDuration(30);
        setSlug("");
        setScheduleName("Default");
        setBufferBefore(0);
        setBufferAfter(0);
        setQuestions([]);
      }
    });
  };

  return (
    <Card className="space-y-5 border-[rgba(29,39,56,0.08)] bg-white/75 shadow-sm">
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Event title</span>
          <Input placeholder="Event title" value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Slug</span>
          <Input placeholder="Slug" value={slug} onChange={(event) => setSlug(event.target.value)} />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Duration</span>
          <Select value={String(duration)} onChange={(event) => setDuration(Number(event.target.value))}>
            {[15, 30, 45, 60].map((value) => (
              <option key={value} value={value}>
                {minutesToLabel(value)}
              </option>
            ))}
          </Select>
        </label>
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Schedule name</span>
          <Input placeholder="Schedule name" value={scheduleName} onChange={(event) => setScheduleName(event.target.value)} />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Buffer before</span>
          <Input type="number" min="0" placeholder="Buffer before" value={bufferBefore} onChange={(event) => setBufferBefore(Number(event.target.value))} />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Buffer after</span>
          <Input type="number" min="0" placeholder="Buffer after" value={bufferAfter} onChange={(event) => setBufferAfter(Number(event.target.value))} />
        </label>
      </div>

      <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-white/80 p-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Custom invitee questions</p>
          <p className="text-sm text-[var(--muted)]">Add optional questions that the invitee will answer while booking.</p>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row">
          <Input placeholder="Custom invitee question" value={questionLabel} onChange={(event) => setQuestionLabel(event.target.value)} />
          <Button
            type="button"
            variant="secondary"
            className="w-full lg:w-auto"
            onClick={() => {
              if (!questionLabel.trim()) return;
              setQuestions((current) => [...current, { id: questionLabel.trim().toLowerCase().replace(/\s+/g, "-"), label: questionLabel.trim(), required: false }]);
              setQuestionLabel("");
            }}
          >
            Add question
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {questions.map((question) => (
            <button key={question.id} type="button" onClick={() => setQuestions((current) => current.filter((item) => item.id !== question.id))} className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-sm text-[var(--accent-strong)]">
              {question.label} x
            </button>
          ))}
        </div>
      </div>

      <Button type="button" onClick={submit} disabled={isPending || !title || !slug} className="w-full sm:w-auto">
        {isPending ? "Saving..." : initialData ? "Update event type" : "Create event type"}
      </Button>
    </Card>
  );
}
