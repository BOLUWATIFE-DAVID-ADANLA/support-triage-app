import Link from "next/link";
import TicketForm from "./components/TicketForm";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center gap-8 px-6 py-16">
      <div className="w-full max-w-xl flex items-center justify-between">
        <h1 className="text-xl font-semibold">Submit a support ticket</h1>
        <Link href="/dashboard" className="text-sm underline opacity-70">
          View dashboard
        </Link>
      </div>
      <TicketForm />
    </main>
  );
}
