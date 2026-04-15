"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type ToastItem = {
  id: number;
  title: string;
  tone?: "success" | "error";
};

type ToastContextValue = {
  pushToast: (title: string, tone?: "success" | "error") => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const value = useMemo(
    () => ({
      pushToast(title: string, tone: "success" | "error" = "success") {
        const id = Date.now();
        setItems((current) => [...current, { id, title, tone }]);
        window.setTimeout(() => {
          setItems((current) => current.filter((item) => item.id !== id));
        }, 2800);
      }
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn("rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur", item.tone === "error" ? "border-red-200 bg-white text-red-700" : "border-emerald-200 bg-white text-emerald-700")}
          >
            {item.title}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
