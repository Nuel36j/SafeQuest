import type { RiskLevel } from "@/types";

// One place for every risk color, so the badge and the score ring always agree.
export const RISK_STYLES: Record<
  RiskLevel,
  { label: string; badge: string; ring: string; track: string; text: string }
> = {
  unknown: {
    label: "Unknown",
    badge: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
    ring: "stroke-slate-400",
    track: "stroke-slate-200 dark:stroke-slate-700",
    text: "text-slate-600 dark:text-slate-300",
  },
  high_risk: {
    label: "High Risk",
    badge: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    ring: "stroke-red-500",
    track: "stroke-red-100 dark:stroke-red-500/20",
    text: "text-red-600 dark:text-red-400",
  },
  caution: {
    label: "Caution",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    ring: "stroke-amber-500",
    track: "stroke-amber-100 dark:stroke-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
  },
  safe: {
    label: "Safe",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    ring: "stroke-emerald-500",
    track: "stroke-emerald-100 dark:stroke-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
  },
};