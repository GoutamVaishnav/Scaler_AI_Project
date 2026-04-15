import { format } from "date-fns";
import nodemailer from "nodemailer";

type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
};

type BookingEmailArgs = {
  hostEmail: string;
  inviteeEmail: string;
  inviteeName: string;
  eventTitle: string;
  startTime: Date;
};

type CancellationEmailArgs = BookingEmailArgs;
type RescheduleEmailArgs = BookingEmailArgs & {
  previousStartTime: Date;
};

function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.EMAIL_FROM
  );
}

async function sendEmail(payload: EmailPayload) {
  if (!isEmailConfigured()) {
    console.log("[email-skipped] SMTP email is not configured.", {
      to: payload.to,
      subject: payload.subject
    });
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: Array.isArray(payload.to) ? payload.to.join(", ") : payload.to,
    subject: payload.subject,
    html: payload.html
  });
}

function formatMeetingTime(startTime: Date) {
  return format(startTime, "PPP p");
}

export async function sendBookingConfirmationEmails(args: BookingEmailArgs) {
  const { hostEmail, inviteeEmail, inviteeName, eventTitle, startTime } = args;
  const when = formatMeetingTime(startTime);

  await Promise.allSettled([
    sendEmail({
      to: hostEmail,
      subject: `New booking: ${eventTitle}`,
      html: `<h2>New meeting booked</h2><p><strong>Event:</strong> ${eventTitle}</p><p><strong>Invitee:</strong> ${inviteeName}</p><p><strong>Email:</strong> ${inviteeEmail}</p><p><strong>Time:</strong> ${when}</p>`
    }),
    sendEmail({
      to: inviteeEmail,
      subject: `Booking confirmed: ${eventTitle}`,
      html: `<h2>Your meeting is confirmed</h2><p><strong>Event:</strong> ${eventTitle}</p><p><strong>Host email:</strong> ${hostEmail}</p><p><strong>Time:</strong> ${when}</p>`
    })
  ]).then((results) => {
    results.forEach((result) => {
      if (result.status === "rejected") {
        console.error("[email-error]", result.reason);
      }
    });
  });
}

export async function sendCancellationEmails(args: CancellationEmailArgs) {
  const { hostEmail, inviteeEmail, inviteeName, eventTitle, startTime } = args;
  const when = formatMeetingTime(startTime);

  await Promise.allSettled([
    sendEmail({
      to: hostEmail,
      subject: `Meeting cancelled: ${eventTitle}`,
      html: `<h2>Meeting cancelled</h2><p><strong>Event:</strong> ${eventTitle}</p><p><strong>Invitee:</strong> ${inviteeName}</p><p><strong>Email:</strong> ${inviteeEmail}</p><p><strong>Original time:</strong> ${when}</p>`
    }),
    sendEmail({
      to: inviteeEmail,
      subject: `Your meeting was cancelled: ${eventTitle}`,
      html: `<h2>Your meeting has been cancelled</h2><p><strong>Event:</strong> ${eventTitle}</p><p><strong>Host email:</strong> ${hostEmail}</p><p><strong>Original time:</strong> ${when}</p>`
    })
  ]).then((results) => {
    results.forEach((result) => {
      if (result.status === "rejected") {
        console.error("[email-error]", result.reason);
      }
    });
  });
}

export async function sendRescheduleEmails(args: RescheduleEmailArgs) {
  const { hostEmail, inviteeEmail, inviteeName, eventTitle, startTime, previousStartTime } = args;
  const previousWhen = formatMeetingTime(previousStartTime);
  const newWhen = formatMeetingTime(startTime);

  await Promise.allSettled([
    sendEmail({
      to: hostEmail,
      subject: `Meeting rescheduled: ${eventTitle}`,
      html: `<h2>Meeting rescheduled</h2><p><strong>Event:</strong> ${eventTitle}</p><p><strong>Invitee:</strong> ${inviteeName}</p><p><strong>Email:</strong> ${inviteeEmail}</p><p><strong>Previous time:</strong> ${previousWhen}</p><p><strong>New time:</strong> ${newWhen}</p>`
    }),
    sendEmail({
      to: inviteeEmail,
      subject: `Your meeting was rescheduled: ${eventTitle}`,
      html: `<h2>Your meeting has been rescheduled</h2><p><strong>Event:</strong> ${eventTitle}</p><p><strong>Host email:</strong> ${hostEmail}</p><p><strong>Previous time:</strong> ${previousWhen}</p><p><strong>New time:</strong> ${newWhen}</p>`
    })
  ]).then((results) => {
    results.forEach((result) => {
      if (result.status === "rejected") {
        console.error("[email-error]", result.reason);
      }
    });
  });
}
