import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)] backdrop-blur sm:p-6", className)}>
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)] sm:text-sm">ScheduleFlow</p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">{title}</h1>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn("w-full rounded-xl border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--foreground)] shadow-sm outline-none transition duration-200 hover:border-[rgba(17,124,112,0.18)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]", props.className)}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn("w-full rounded-xl border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--foreground)] shadow-sm outline-none transition duration-200 hover:border-[rgba(17,124,112,0.18)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]", props.className)}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn("w-full rounded-xl border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--foreground)] shadow-sm outline-none transition duration-200 hover:border-[rgba(17,124,112,0.18)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]", props.className)}
    />
  );
}

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const variants = {
    primary: "bg-[var(--accent)] text-white shadow-sm hover:bg-[var(--accent-strong)]",
    secondary: "bg-[var(--accent-soft)] text-[var(--accent-strong)] hover:bg-[rgba(13,138,116,0.18)]",
    ghost: "bg-transparent text-[var(--foreground)] hover:bg-black/5",
    danger: "bg-[var(--danger)] text-white hover:opacity-90"
  };

  return (
    <button
      {...props}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
    />
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent-strong)]">{children}</span>;
}
