// "safe" appears in the design. The backend only returns unknown / caution / high_risk.
export type RiskLevel = "unknown" | "high_risk" | "caution" | "safe";

export interface Post {
  id: number;
  username: string;
  timeAgo: string;
  content: string;
  link?: string;
  risk: RiskLevel;
  likes?: number;
  comments?: number;
  reposts?: number;
  attachment?: "call-screenshot" | "photo";
}

export interface CheckResult {
  query: string;
  riskLevel: RiskLevel;
  score: number; // 0 to 100
  recentReports: number;
  mainScamTypes: string[];
  lastReported: string;
}

export interface ScamTypeStat {
  label: string;
  percent: number;
}

