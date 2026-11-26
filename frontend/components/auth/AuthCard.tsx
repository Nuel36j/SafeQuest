import type { ReactNode } from "react";

import { ShieldBoltIcon } from "@/components/ui/icons";
import { cardClass } from "@/lib/styles";

// Centered card used by the login and register pages (no sidebar).
export default function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <ShieldBoltIcon className="h-10 w-10 text-indigo-700 dark:text-indigo-400" />
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Safe<span className="text-indigo-700 dark:text-indigo-400">Quest</span>
          </span>
        </div>
        <div className={cardClass}>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
          {subtitle ? <p className="mt-1 text-slate-600 dark:text-slate-300">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
