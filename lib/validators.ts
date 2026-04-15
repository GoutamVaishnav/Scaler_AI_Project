import { z } from "zod";

export const customQuestionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["text"]).default("text"),
  required: z.boolean().default(false)
});

export const eventTypeSchema = z.object({
  title: z.string().min(2),
  duration: z.coerce.number().int().positive(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  scheduleName: z.string().min(1).default("Default"),
  bufferBefore: z.coerce.number().int().min(0).default(0),
  bufferAfter: z.coerce.number().int().min(0).default(0),
  customQuestions: z.array(customQuestionSchema).default([])
});

export const availabilityPayloadSchema = z.object({
  timezone: z.string().min(1),
  blocks: z.array(
    z.object({
      dayOfWeek: z.coerce.number().int().min(0).max(6),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
      scheduleName: z.string().min(1)
    })
  )
});

export const overrideAvailabilitySchema = z.object({
  date: z.string(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/)
});

export const bookingSchema = z.object({
  eventTypeId: z.string().min(1),
  date: z.string(),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  timezone: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  customAnswers: z.record(z.string(), z.string()).default({})
});

export const meetingUpdateSchema = z.object({
  action: z.enum(["cancel", "reschedule"]),
  date: z.string().optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  timezone: z.string().optional()
});
