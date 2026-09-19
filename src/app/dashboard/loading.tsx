import type { CSSProperties } from "react";

function Pulse({ className, style }: { className: string; style?: CSSProperties }) {
  return (
    <div className={`animate-pulse rounded-lg bg-[var(--gridline)] ${className}`} style={style} />
  );
}

export default function DashboardLoading() {
  return (
    <main className="flex-1 px-6 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Pulse className="h-7 w-56" />
            <Pulse className="h-4 w-80" />
          </div>
          <Pulse className="h-8 w-32" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Pulse className="h-24" />
          <Pulse className="h-24" />
          <Pulse className="h-24" />
        </div>

        <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-6">
          <Pulse className="h-4 w-24" />
          <div className="mt-4 flex flex-col gap-3">
            <Pulse className="h-2 w-full" />
            <Pulse className="h-2 w-full" />
            <Pulse className="h-2 w-full" />
          </div>
          <div className="mt-8 flex h-32 items-end gap-2">
            {[55, 80, 40, 65, 90, 50, 70].map((h, i) => (
              <Pulse key={i} className="w-full" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-6">
            <Pulse className="h-4 w-32" />
            <div className="mt-4 flex flex-col gap-3">
              <Pulse className="h-2 w-full" />
              <Pulse className="h-2 w-full" />
              <Pulse className="h-2 w-full" />
            </div>
          </div>
          <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--surface-1)] p-6">
            <Pulse className="h-4 w-32" />
            <div className="mt-4 flex flex-col gap-3">
              <Pulse className="h-10 w-full" />
              <Pulse className="h-10 w-full" />
              <Pulse className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
