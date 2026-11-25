import type { IdentifierType } from "@/types/api";

// A best guess at what was typed. Digit-only input can be ambiguous (a 10-digit number could be
// a phone number or a bank account), so the pages let the user change the type afterwards.
export function guessIdentifierType(value: string): IdentifierType {
  const text = value.trim();
  if (/[a-zA-Z]/.test(text) || text.includes("/")) return "url";

  const digits = text.replace(/[^0-9]/g, "");
  if (text.startsWith("+") || digits.startsWith("234")) return "phone";
  if (digits.length === 11 && digits.startsWith("0")) return "phone";
  if (digits.length === 10 && "789".includes(digits[0])) return "phone";
  if (digits.length === 10) return "account";
  return "phone";
}