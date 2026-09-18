"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SeedButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await fetch("/api/reports/seed", { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="self-start rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
    >
      {loading ? "Seeding..." : "Seed demo data"}
    </button>
  );
}
