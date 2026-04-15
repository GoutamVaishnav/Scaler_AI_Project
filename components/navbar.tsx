"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { CalendarDays, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/event", label: "Event Types" },
  { href: "/availability", label: "Availability" },
  { href: "/meetings", label: "Meetings" },
] satisfies Array<{ href: Route; label: string }>;

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-20 border-b border-[rgba(29,39,56,0.08)] bg-[rgba(250,247,241,0.8)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#111827,#117c70)] text-white shadow-[0_10px_24px_rgba(17,24,39,0.18)]">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)] sm:text-xs">
              Scheduling Platform
            </p>
            <h2 className="truncate text-xl font-semibold tracking-tight text-[#0f172a]">
              ScheduleFlow
            </h2>
          </div>
        </Link>
        <Button
          variant="ghost"
          className="h-11 w-11 rounded-full border border-[rgba(29,39,56,0.08)] bg-white/80 p-0 shadow-sm lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <nav className="hidden items-center gap-2 rounded-full border border-[rgba(29,39,56,0.08)] bg-white/72 p-1.5 shadow-sm lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2.5 text-center text-sm font-medium transition duration-200",
                pathname.startsWith(link.href)
                  ? "bg-[#18bbaa] text-white shadow-[0_8px_20px_rgba(17,24,39,0.18)]"
                  : "text-[var(--foreground)] hover:bg-white hover:shadow-sm",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      {open ? (
        <div
          className="fixed inset-0 z-40 h-dvh min-h-screen bg-[rgba(17,24,39,0.34)] backdrop-blur-[2px] lg:hidden"
          onClick={() => setOpen(false)}
        >
          <aside
            className="ml-auto flex h-dvh min-h-screen w-[86vw] max-w-sm flex-col border-l border-[rgba(29,39,56,0.08)] bg-[var(--card-strong)] px-5 pb-6 pt-4 shadow-2xl animate-[slideIn_.18s_ease-out]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-3 border-b border-[var(--border)] pb-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#111827,#117c70)] text-white shadow-sm">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                    Navigation
                  </p>
                  <h3 className="truncate text-lg font-semibold">
                    ScheduleFlow
                  </h3>
                </div>
              </div>
              <Button
                variant="ghost"
                className="h-10 w-10 rounded-full p-0"
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="grid gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-2xl px-4 py-3.5 text-sm font-medium transition duration-200",
                    pathname.startsWith(link.href)
                      ? "bg-[#12756b] text-white shadow-[0_8px_20px_rgba(18,117,107,0.24)]"
                      : "bg-white text-[var(--foreground)] hover:bg-[var(--accent-soft)]",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto pt-6 text-xs leading-5 text-[var(--muted)]">
              Manage events, availability, and meetings from one place.
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
