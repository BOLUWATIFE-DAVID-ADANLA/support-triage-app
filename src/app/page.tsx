import TicketForm from "./components/TicketForm";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center gap-8 px-6 py-16">
      <div className="w-full max-w-xl">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Customer support
        </span>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Tell us what went wrong
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Having trouble with a payment, transfer, or your account? Describe the
          issue below and it&apos;s triaged immediately — analyzed for sentiment,
          routed to the right team, and flagged for engineering when it&apos;s a
          genuine bug rather than a billing question.
        </p>
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          Please don&apos;t include full card numbers, passwords, or other
          sensitive account details — a support agent will never ask for these.
        </p>
      </div>
      <TicketForm />
    </main>
  );
}
