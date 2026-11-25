// SQLite returns times without a timezone ("2026-11-22T14:47:00"). Browsers would read that
// as local time, so treat it as UTC, which is what the backend stores.
export function parseApiDate(value: string): Date {
  const hasZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value);
  return new Date(hasZone ? value : `${value}Z`);
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"} ago`;
}

export function timeAgo(value: string | null): string {
  if (!value) return "Never";
  const seconds = Math.max(0, Math.floor((Date.now() - parseApiDate(value).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return plural(minutes, "minute");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return plural(hours, "hour");
  const days = Math.floor(hours / 24);
  if (days < 30) return plural(days, "day");
  return parseApiDate(value).toLocaleDateString();
}

export function formatDateTime(value: string | null): string {
  return value ? parseApiDate(value).toLocaleString() : "";
}