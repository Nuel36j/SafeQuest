import Link from "next/link";

import { ArrowRightIcon, FlameIcon } from "@/components/ui/icons";
import type { ScamTypeStat } from "@/types";

const DOTS = ["bg-red-500", "bg-blue-500", "bg-emerald-500", "bg-orange-500"];
const BARS = ["bg-indigo-400", "bg-sky-300", "bg-teal-300", "bg-amber-400"];

type Props = {
  stats?: ScamTypeStat[];
};

export default function TrendingScamTypes({ stats = [] }: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <FlameIcon className="h-5 w-5 text-orange-500" /> Trending Scam Types
        </h2>
        <Link
          href="#"
          className="flex items-center gap-1 text-sm font-semibold text-indigo-700 hover:underline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-indigo-400"
        >
          See all <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <ul className="mt-5 space-y-4">
        {stats.map((stat, index) => (
          <li key={stat.label}>
            <div className="flex items-center gap-3">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOTS[index % DOTS.length]}`} />
              <span className="flex-1 font-medium text-slate-800 dark:text-slate-200">{stat.label}</span>
              <span className="font-semibold text-slate-900 dark:text-white">{stat.percent}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className={`h-full rounded-full ${BARS[index % BARS.length]}`}
                style={{ width: `${stat.percent}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}