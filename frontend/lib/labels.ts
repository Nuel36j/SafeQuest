import type { IdentifierType, ScamType } from "@/types/api";

export const IDENTIFIER_TYPE_LABELS: Record<IdentifierType, string> = {
  phone: "Phone number",
  account: "Bank account",
  url: "Link",
};

export const IDENTIFIER_PLACEHOLDERS: Record<IdentifierType, string> = {
  phone: "0801 234 5678",
  account: "0123456789",
  url: "example.com/offer",
};

export const SCAM_TYPE_LABELS: Record<ScamType, string> = {
  impersonation: "Impersonation",
  ponzi: "Fake Investment",
  phishing: "Phishing",
  romance: "Romance Scam",
  fake_alert: "Fake Payment Alert",
  job_scam: "Job Scam",
  advance_fee: "Advance Fee",
  non_delivery: "Goods Never Delivered",
  other: "Other",
};

export const SCAM_TYPES = Object.keys(SCAM_TYPE_LABELS) as ScamType[];

export function scamTypeLabel(key: string): string {
  return (SCAM_TYPE_LABELS as Record<string, string>)[key] ?? key;
}