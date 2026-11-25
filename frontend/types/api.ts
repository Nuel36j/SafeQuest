// Shapes returned by the backend. Field names match the API exactly (snake_case).

export type IdentifierType = "phone" | "account" | "url";
export type ReportStatus = "pending" | "approved" | "rejected";
export type ScamType =
  | "fake_alert"
  | "ponzi"
  | "phishing"
  | "romance"
  | "job_scam"
  | "impersonation"
  | "advance_fee"
  | "non_delivery"
  | "other";

export interface User {
  id: number;
  handle: string; // the username
  role: string; // "user" or "admin"
  reputation_score: number; // the user's trust score
  is_active: boolean;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface SearchResult {
  found: boolean;
  identifier_type: IdentifierType;
  risk_level: "unknown" | "caution" | "high_risk";
  approved_report_count: number;
  scam_types: Record<string, number>;
  last_reported_at: string | null;
}

export interface ReportCreate {
  identifier_type: IdentifierType;
  identifier_value: string;
  bank: string | null; // required by the backend when identifier_type is "account"
  scam_type: ScamType;
  description: string;
}

export interface Report {
  id: number;
  identifier_id: number;
  scam_type: ScamType;
  status: ReportStatus;
  created_at: string | null;
}

export interface AdminReport {
  id: number;
  identifier_type: IdentifierType;
  identifier_value: string;
  scam_type: ScamType;
  description: string;
  status: ReportStatus;
  reporter_handle: string;
  reporter_reputation: number;
  created_at: string | null;
}

export interface AuditLog {
  id: number;
  actor_id: number;
  action: string;
  target_type: string;
  target_id: number;
  detail: string | null;
  created_at: string | null;
}

export function listFeed(skip = 0, limit = 20) {
  const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
  return request<FeedPost[]>(`/reports?${params.toString()}`, {}, false);
}