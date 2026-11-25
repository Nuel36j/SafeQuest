"use client";

import { InfoIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { useAuthStore } from "@/store/authStore";

export default function TrustScoreCard() {
  const user = useAuthStore((state) => state.user);

  // Logged out (or still loading): show nothing instead of a made-up score.
  if (!user) return null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
        Your Trust Score <InfoIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
      </h2>

      <div className="mt-5 flex items-center justify-center gap-5">
        <ShieldCheckIcon
          className={`h-20 w-20 ${user.reputation_score > 0 ? "text-emerald-500" : "text-slate-400 dark:text-slate-600"}`}
        />
        <p className="text-5xl font-extrabold text-slate-900 dark:text-white">
          {user.reputation_score.toFixed(1)}
        </p>
      </div>

      <p className="mt-5 text-center text-slate-600 dark:text-slate-300">
        Goes up when moderators approve your reports.
      </p>
    </section>
  );
}