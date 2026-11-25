"use client";

import { useState } from "react";

import AuditLog from "@/components/admin/AuditLog";
import ReviewQueue from "@/components/admin/ReviewQueue";
import UserModeration from "@/components/admin/UserModeration";
import AppShell from "@/components/layout/AppShell";
import { pillClass } from "@/lib/styles";

type Tab = "queue" | "users" | "audit";

const TABS: { key: Tab; label: string }[] = [
  { key: "queue", label: "Review queue" },
  { key: "users", label: "Ban / unban" },
  { key: "audit", label: "Audit log" },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("queue");

  return (
    <AppShell adminOnly>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Admin</h1>

      <div className="mt-6 flex flex-wrap gap-3" role="group" aria-label="Admin sections">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-pressed={tab === item.key}
            onClick={() => setTab(item.key)}
            className={pillClass(tab === item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "queue" ? <ReviewQueue /> : null}
        {tab === "users" ? <UserModeration /> : null}
        {tab === "audit" ? <AuditLog /> : null}
      </div>
    </AppShell>
  );
}