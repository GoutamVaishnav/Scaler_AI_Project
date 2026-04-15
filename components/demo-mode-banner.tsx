import { Card } from "@/components/ui";

export function DemoModeBanner({ message }: { message: string }) {
  return (
    <Card className="border-[rgba(232,138,95,0.28)] bg-[linear-gradient(135deg,rgba(232,138,95,0.18),rgba(255,255,255,0.78))]">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a3412]">Demo mode</p>
        <p className="text-sm leading-6 text-[#7c2d12]">
          {message} You can keep exploring the UI, but save and booking actions will stay read-only until the database connection is restored.
        </p>
      </div>
    </Card>
  );
}
