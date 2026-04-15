"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { useToast } from "@/components/toast";

type CustomQuestion = {
  id: string;
  label: string;
  required?: boolean;
};

export function BookingForm({
  eventTypeId,
  date,
  time,
  timezone,
  customQuestions
}: {
  eventTypeId: string;
  date: string;
  time: string;
  timezone: string;
  customQuestions: CustomQuestion[];
}) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const disabled = !date || !time || !name || !email || customQuestions.some((question) => question.required && !answers[question.id]);

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();

        startTransition(async () => {
          const response = await fetch("/api/book", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventTypeId,
              date,
              time,
              timezone,
              name,
              email,
              customAnswers: answers
            })
          });

          const data = await response.json();
          if (!response.ok) {
            pushToast(data.error ?? "Unable to complete booking.", "error");
            return;
          }

          pushToast("Meeting booked successfully.");
          router.push(`/confirmation?meetingId=${data.meeting.id}`);
        });
      }}
    >
      <Input placeholder="Your name" value={name} onChange={(event) => setName(event.target.value)} />
      <Input placeholder="Your email" value={email} type="email" onChange={(event) => setEmail(event.target.value)} />
      {customQuestions.map((question) => (
        <Input
          key={question.id}
          placeholder={question.label}
          value={answers[question.id] ?? ""}
          required={question.required}
          onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))}
        />
      ))}
      <Button type="submit" disabled={disabled || isPending} className="w-full">
        {isPending ? "Booking..." : "Confirm booking"}
      </Button>
    </form>
  );
}
