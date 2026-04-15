import type { Metadata } from "next";
import "@/app/globals.css";
import { Navbar } from "@/components/navbar";
import { ToastProvider } from "@/components/toast";

export const metadata: Metadata = {
  title: "ScheduleFlow",
  description: "A production-ready scheduling platform built with Next.js, Prisma, and Neon."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <div className="min-h-screen">
            <Navbar />
            <main className="mx-auto flex w-full max-w-7xl flex-col px-4 pb-14 pt-5 sm:px-6 sm:pt-6 lg:px-8">
              {children}
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
