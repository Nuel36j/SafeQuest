"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import AppShell from "@/components/layout/AppShell";
import ResultCard from "@/components/explore/ResultCard";
import { SearchIcon } from "@/components/ui/icons";
import { ApiError, getErrorMessage, searchIdentifier } from "@/lib/api";
import { IDENTIFIER_PLACEHOLDERS, IDENTIFIER_TYPE_LABELS } from "@/lib/labels";
import { cardClass, errorClass, inputClass, labelClass, pillClass, primaryButtonClass } from "@/lib/styles";
import type { IdentifierType, SearchResult } from "@/types/api";

const TYPES: IdentifierType[] = ["phone", "account", "url"];

export default function ExplorePage() {
  const [type, setType] = useState<IdentifierType>("phone");
  const [query, setQuery] = useState("");
  const [bank, setBank] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);

    async function runSearch(searchType: IdentifierType, text: string, bankName: string) {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      setResult(await searchIdentifier(searchType, text, searchType === "account" ? bankName : undefined));
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runSearch(type, query.trim(), bank.trim());
  }

  // Arriving from the top bar search: /explore?type=phone&q=08012345678
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const text = params.get("q");
    const kind = params.get("type");
    if (!text) return;
    const initialType: IdentifierType = kind === "account" || kind === "url" ? kind : "phone";
    setType(initialType);
    setQuery(text);
    // An account search also needs a bank name, so wait for the user to fill it in.
    if (initialType !== "account") runSearch(initialType, text, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <AppShell requireAuth={false}>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Explore</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        Check a phone number, bank account or link before you trust it.
      </p>

      <form onSubmit={handleSubmit} className={`${cardClass} mt-6 space-y-5`}>
        <div className="flex flex-wrap gap-3" role="group" aria-label="What are you checking?">
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
          <div>
            <label htmlFor="bank" className={labelClass}>
              Bank name
            </label>
            <input
              id="bank"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              placeholder="e.g. GTBank, Opay"
              required
              className={inputClass}
            />
          </div>
        ) : null}

        <div>
          <label htmlFor="query" className={labelClass}>
            {IDENTIFIER_TYPE_LABELS[type]}
          </label>
          <div className="flex gap-3">
            <input
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={IDENTIFIER_PLACEHOLDERS[type]}
              minLength={3}
              maxLength={512}
              required
              className={inputClass}
            />
            <button type="submit" disabled={loading} className={`${primaryButtonClass} flex shrink-0 items-center gap-2`}>
              <SearchIcon className="h-5 w-5" />
              {loading ? "Checking..." : "Check"}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-6">
        {error ? <p className={errorClass}>{error}</p> : null}
        {result ? <ResultCard result={result} /> : null}
      </div>
    </AppShell>
  );
}