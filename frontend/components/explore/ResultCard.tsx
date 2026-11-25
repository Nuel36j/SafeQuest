import RiskBadge from "@/components/ui/RiskBadge";
import { timeAgo } from "@/lib/format";
import { scamTypeLabel } from "@/lib/labels";
import { cardClass } from "@/lib/styles";
import type { SearchResult } from "@/types/api";

function summary(result: SearchResult): string {
  const count = result.approved_report_count;
  if (result.risk_level === "high_risk") {
    return "Several people have reported this. Don't send money or personal details.";
  }
  if (result.risk_level === "caution") {
    return "People have reported this. Be careful before sending money or personal details.";
  }
  if (count > 0) {
    return "There are a few reports, but not enough yet to rate it. Be careful.";
  }
  return "No reports yet. That doesn't mean it's safe, so always verify before you pay.";
}

export default function ResultCard({ result }: { result: SearchResult }) {
  const types = Object.entries(result.scam_types).sort((a, b) => b[1] - a[1]);

  return (
    <section className={cardClass} aria-live="polite">
      <RiskBadge level={result.risk_level} />
      <p className="mt-3 text-lg text-slate-800 dark:text-slate-200">{summary(result)}</p>

      <dl className="mt-6 grid grid-cols-2 gap-6">
        <div>
          <dt className="text-slate-600 dark:text-slate-300">Reports</dt>
          <dd className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{result.approved_report_count}</dd>
        </div>
        <div>
          <dt className="text-slate-600 dark:text-slate-300">Last reported</dt>
          <dd className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
            {result.last_reported_at ? timeAgo(result.last_reported_at) : "Never"}
          </dd>
        </div>
      </dl>

      {types.length > 0 ? (
        <div className="mt-6">
          <p className="text-slate-600 dark:text-slate-300">Main scam types</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {types.map(([key, count]) => (
              <li
                key={key}
                className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200"
              >
                {scamTypeLabel(key)} · {count}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}