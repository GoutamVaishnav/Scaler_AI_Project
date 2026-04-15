# ScheduleFlow

ScheduleFlow is a Calendly-style scheduling platform built with Next.js App Router, Tailwind CSS, Prisma, and PostgreSQL on Neon.

## Folder structure

```text
.
|-- app
|   |-- api
|   |   |-- availability
|   |   |   |-- override/route.ts
|   |   |   `-- route.ts
|   |   |-- book/route.ts
|   |   |-- event
|   |   |   |-- [id]/route.ts
|   |   |   `-- route.ts
|   |   |-- meetings
|   |   |   |-- [id]/route.ts
|   |   |   `-- route.ts
|   |   `-- slots/[slug]/route.ts
|   |-- availability/page.tsx
|   |-- book/[slug]/page.tsx
|   |-- confirmation/page.tsx
|   |-- dashboard/page.tsx
|   |-- event/page.tsx
|   |-- meetings/page.tsx
|   |-- globals.css
|   |-- layout.tsx
|   `-- page.tsx
|-- components
|-- lib
|-- prisma
|-- .env.example
|-- next.config.ts
|-- package.json
|-- postcss.config.mjs
|-- README.md
`-- tsconfig.json
```

## Features

- Event type CRUD with unique slugs and public booking pages.
- Multiple weekly schedules and date-specific override availability.
- Timezone-aware slot generation with buffer handling and overlap prevention.
- Public booking flow with custom invitee questions and confirmation page.
- Upcoming and past meetings with cancel and reschedule actions.
- Booking confirmation and cancellation emails through Nodemailer SMTP when configured.
- Responsive dashboard and booking experience for mobile, tablet, and desktop.

## Slot generation logic

1. Load the event type, weekly availability blocks, override availability, and existing scheduled meetings.
2. If a date-specific override exists for the selected day, use that window instead of the weekly day-of-week schedule.
3. Convert the selected date and time windows from the chosen timezone into UTC.
4. Walk through each availability window in increments of the event duration.
5. For every candidate slot, calculate the real meeting start and end time.
6. Expand each existing meeting by its `bufferBefore` and `bufferAfter`.
7. Reject any candidate slot that overlaps one of those blocked ranges.
8. Reject slots that are already in the past.
9. Return the remaining slots as label/value pairs for the UI.

This logic lives in [lib/scheduler.ts](/C:/Users/Goutam/Documents/New%20project/lib/scheduler.ts).

## Setup guide

### 1. Create a Neon database

1. Sign in to [Neon](https://neon.tech/).
2. Create a new project and copy the PostgreSQL connection string.
3. Put that value in `.env` using the same key as `.env.example`.

### Optional: configure emails with Gmail SMTP

Add these values in `.env` if you want real booking and cancellation emails:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"
EMAIL_FROM="your-email@gmail.com"
```

To get `SMTP_PASS` for Gmail:

1. Turn on 2-Step Verification in your Google account.
2. Open Google App Passwords.
3. Create a new app password.
4. Paste that 16-character password into `SMTP_PASS`.

If these keys are missing, the app will skip sending emails and log that email is not configured.

### 2. Install dependencies

```bash
npm install
```

### 3. Generate Prisma client and create schema

```bash
npm run prisma:generate
npx prisma migrate dev --name init
```

### 4. Seed sample data

```bash
npm run prisma:seed
```

### 5. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API routes

- `GET /api/event`
- `POST /api/event`
- `PUT /api/event/[id]`
- `DELETE /api/event/[id]`
- `GET /api/availability`
- `POST /api/availability`
- `POST /api/availability/override`
- `GET /api/slots/[slug]?date=YYYY-MM-DD&timezone=Zone`
- `POST /api/book`
- `GET /api/meetings`
- `PUT /api/meetings/[id]`

## Notes

- Run the seed script before opening the dashboard because the app expects a default user.
- Booking and cancellation emails are sent to both the host and invitee when SMTP is configured.
- The schema is easy to extend with authentication later by replacing the default user lookup.
