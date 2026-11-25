import { RISK_STYLES } from "@/lib/risk";
import type { RiskLevel } from "@/types";

import { AlertTriangleIcon, CheckCircleIcon, InfoIcon } from "./icons";

export default function RiskBadge({ level }: { level: RiskLevel }) {
  const style = RISK_STYLES[level];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${style.badge}`}>
      {level === "safe" ? (
        <CheckCircleIcon className="h-4 w-4" />
      ) : level === "unknown" ? (
        <InfoIcon className="h-4 w-4" />
      ) : (
        <AlertTriangleIcon className="h-4 w-4" />
      )}
      {style.label}
    </span>
  );
}