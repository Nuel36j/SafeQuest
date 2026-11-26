import { useAuthStore } from "@/store/authStore";
import type {
  AdminReport,
  AuditLog,
  FeedPost,
  IdentifierType,
  Report,
  ReportCreate,
  ReportStatus,
  ScamType,
  SearchResult,
  Token,
  User,
} from "@/types/api";

// Where the backend runs. Override with NEXT_PUBLIC_API_URL in .env.local if it moves.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://safequest-api.onrender.com/api/v1";


export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong. Please try again.";
}

// FastAPI sends errors as {"detail": "text"} or, for validation errors, {"detail": [{loc, msg}, ...]}.
function readDetail(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const detail = (body as { detail?: unknown }).detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item: { loc?: unknown[]; msg?: string }) => {
        const field = Array.isArray(item.loc) ? item.loc.slice(1).join(".") : "";
        return field ? `${field}: ${item.msg}` : String(item.msg);
      })
      .join(". ");
  }
  return null;
}

async function request<T>(path: string, init: RequestInit = {}, auth = true): Promise<T> {
  const headers = new Headers(init.headers);
  const token = useAuthStore.getState().token;
  if (auth && token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {

    throw new ApiError(0, "Can't reach the server. Try again later!");
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      message = readDetail(await response.json()) ?? message;
    } catch {
      // The error body wasn't JSON. Keep the default message.
    }
    // An expired or invalid token: sign the user out so they are sent to the login page.
    if (response.status === 401 && auth && token) useAuthStore.getState().logout();
    throw new ApiError(response.status, message);
  }
  return (await response.json()) as T;
}

function jsonInit(method: string, data: unknown): RequestInit {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };
}

// ---- Auth ----

export function register(handle: string, password: string) {
  const body = new URLSearchParams({ username: handle, password });
  return request<User>("/auth/register", jsonInit("POST", { handle, password }), false);
}

export function login(handle: string, password: string) {
  // The login endpoint expects form data, and calls the username field "username".
  const body = new URLSearchParams({ username: handle, password });
  return request<Token>("/auth/login", { method: "POST", body }, false);
}

// ---- Current user ----

export function getMe() {
  return request<User>("/users/me");
}

export function changePassword(password: string) {
  return request<User>("/users/me", jsonInit("PATCH", { password }));
}

// ---- Search and reports ----

export function searchIdentifier(type: IdentifierType, q: string, bank?: string) {
  const params = new URLSearchParams({ type, q });
  if (bank) params.set("bank", bank);
  return request<SearchResult>(`/search?${params.toString()}`, {}, false);
}

export function createReport(data: ReportCreate) {
  return request<Report>("/reports", jsonInit("POST", data));
}

// ---- Admin ----

export function listAdminReports(status: ReportStatus, skip = 0, limit = 50) {
  const params = new URLSearchParams({ status, skip: String(skip), limit: String(limit) });
  return request<AdminReport[]>(`/admin/reports?${params.toString()}`);
}

export function reviewReport(reportId: number, status: "approved" | "rejected") {
  return request<AdminReport>(`/admin/reports/${reportId}`, jsonInit("PATCH", { status }));
}

export function setUserActive(userId: number, isActive: boolean) {
  return request<User>(`/admin/users/${userId}`, jsonInit("PATCH", { is_active: isActive }));
}

export function listAuditLogs(skip = 0, limit = 50) {
  const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
  return request<AuditLog[]>(`/admin/audit-logs?${params.toString()}`);
}


export function listFeed(
  skip = 0,
  limit = 20,
  options: { identifierType?: IdentifierType; newestFirst?: boolean } = {},
) {
  const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
  if (options.identifierType) params.set("identifier_type", options.identifierType);
  if (options.newestFirst === false) params.set("newest_first", "false");
  return request<FeedPost[]>(`/reports?${params.toString()}`, {}, false);
}
