import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-[var(--border-hairline)]">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Support Triage
        </Link>
        <nav className="flex items-center gap-5 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--text-primary)]">
            Submit ticket
          </Link>
          <Link href="/dashboard" className="hover:text-[var(--text-primary)]">
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
