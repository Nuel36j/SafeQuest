"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { CalendarIcon, SearchIcon } from "@/components/ui/icons";
import { ApiError, getErrorMessage, searchIdentifier } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { IDENTIFIER_PLACEHOLDERS, IDENTIFIER_TYPE_LABELS, scamTypeLabel } from "@/lib/labels";
import { RISK_STYLES } from "@/lib/risk";
import { errorClass, inputClass, pillClass } from "@/lib/styles";
import type { IdentifierType, SearchResult } from "@/types/api";

const TYPES: IdentifierType[] = ["phone", "account", "url"];

export default function CheckCard() {
  const [type, setType] = useState<IdentifierType>("phone");
  const [query, setQuery] = useState("");
  const [bank, setBank] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      setResult(await searchIdentifier(type, query.trim(), type === "account" ? bank.trim() : undefined));
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 429
          ? "You're searching too fast. Wait a moment and try again."
          : getErrorMessage(err),
      );
    } finally {
      setLoading(false);
    }
  }

  const style = result ? RISK_STYLES[result.risk_level] : null;
  const scamTypes = result ? Object.entries(result.scam_types).sort((a, b) => b[1] - a[1]) : [];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <div className="flex h-14 min-w-0 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:outline-2 focus-within:outline-indigo-500 dark:border-slate-700 dark:bg-slate-800 sm:px-5">
            <SearchIcon className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={IDENTIFIER_PLACEHOLDERS[type]}
              aria-label="Phone number, account number or URL to check"
              minLength={3}
              maxLength={512}
              required
              className="min-w-0 flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-500 dark:text-slate-100 dark:placeholder:text-slate-400 sm:text-lg"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-indigo-600 px-5 text-base font-semibold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 sm:px-8 sm:text-lg"
          >
            {loading ? "Checking..." : "Check"}
          </button>
        </div>

        {/* The backend needs to know what kind of thing is being checked. */}
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="What are you checking?">
          {TYPES.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={type === option}
              onClick={() => setType(option)}
              className={pillClass(type === option)}
            >
              {IDENTIFIER_TYPE_LABELS[option]}
            </button>
          ))}
        </div>

        {type === "account" ? (
          <input
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            placeholder="Bank name, e.g. GTBank, Opay"
            aria-label="Bank name"
            required
            className={`${inputClass} mt-4`}
          />
        ) : null}
      </form>

      {error ? <p className={`${errorClass} mt-4`}>{error}</p> : null}

      {/* Nothing is shown until a real search comes back. */}
      {result && style ? (
        <div aria-live="polite">
          <div className="mt-6 grid grid-cols-2 gap-6 sm:flex sm:flex-wrap sm:items-center sm:gap-x-10 sm:gap-y-6">
            <div className="relative col-span-2 h-[116px] w-[116px] shrink-0 sm:col-span-1">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
                <circle cx="60" cy="60" r="52" fill="none" strokeWidth={9} className={style.ring} />
              </svg>
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center text-xl font-extrabold leading-tight ${style.text}`}
              >
                {style.label.split(" ").map((word) => (
                  <span key={word}>{word}</span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{result.approved_report_count}</p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                {result.approved_report_count === 1 ? "Report" : "Reports"}
              </p>
            </div>

            {scamTypes.length > 0 ? (
              <div>
                <p className="max-w-[11rem] text-lg font-semibold leading-snug text-slate-900 dark:text-white">
                  {scamTypes.map(([key]) => scamTypeLabel(key)).join(", ")}
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Main Scam Types</p>
              </div>
            ) : null}

            {result.last_reported_at ? (
              <div>
                <p className="text-slate-600 dark:text-slate-300">Last Reported</p>
                <p className="mt-1 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  <CalendarIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  {timeAgo(result.last_reported_at)}
                </p>
              </div>
            ) : null}
          </div>

          {result.approved_report_count === 0 ? (
            <p className="mt-5 text-slate-600 dark:text-slate-300">
              No reports yet. That doesn&apos;t mean it&apos;s safe, so always verify before you pay.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}