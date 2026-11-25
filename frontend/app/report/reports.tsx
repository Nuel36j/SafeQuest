"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import AppShell from "@/components/layout/AppShell";
import { createReport, getErrorMessage } from "@/lib/api";
import { IDENTIFIER_PLACEHOLDERS, IDENTIFIER_TYPE_LABELS, SCAM_TYPES, SCAM_TYPE_LABELS } from "@/lib/labels";
import {
  cardClass,
  errorClass,
  inputClass,
  labelClass,
  pillClass,
  primaryButtonClass,
  secondaryButtonClass,
  successClass,
} from "@/lib/styles";
import type { IdentifierType, Report, ScamType } from "@/types/api";

const TYPES: IdentifierType[] = ["phone", "account", "url"];
const MAX_DESCRIPTION = 2000;

export default function ReportPage() {
  const [type, setType] = useState<IdentifierType>("phone");
  const [value, setValue] = useState("");
  const [bank, setBank] = useState("");
  const [scamType, setScamType] = useState<ScamType>("impersonation");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<Report | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const report = await createReport({
        identifier_type: type,
        identifier_value: value.trim(),
        bank: type === "account" ? bank.trim() : null,
        scam_type: scamType,
        description: description.trim(),
      });
      setSubmitted(report);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function reportAnother() {
    setSubmitted(null);
    setValue("");
    setBank("");
    setDescription("");
  }

  return (
    <AppShell>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Report a scam</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        Help others by sharing a phone number, bank account or link that scammed or tried to scam you.
      </p>

      {submitted ? (
        <div className={`${cardClass} mt-6`}>
          <p className={successClass}>
            {submitted.status === "approved"
              ? "Your report is live. Thank you for helping others stay safe."
              : "Thanks! Your report is waiting for review and will count once it's approved."}
          </p>
          <button type="button" onClick={reportAnother} className={`${secondaryButtonClass} mt-5`}>
            Report another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={`${cardClass} mt-6 space-y-5`}>
          <div className="flex flex-wrap gap-3" role="group" aria-label="What are you reporting?">
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
            <label htmlFor="value" className={labelClass}>
              {IDENTIFIER_TYPE_LABELS[type]}
            </label>
            <input
              id="value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={IDENTIFIER_PLACEHOLDERS[type]}
              minLength={3}
              maxLength={512}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="scamType" className={labelClass}>
              Type of scam
            </label>
            <select
              id="scamType"
              value={scamType}
              onChange={(e) => setScamType(e.target.value as ScamType)}
              className={inputClass}
            >
              {SCAM_TYPES.map((key) => (
                <option key={key} value={key}>
                  {SCAM_TYPE_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              What happened?
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              minLength={10}
              maxLength={MAX_DESCRIPTION}
              required
              className={inputClass}
            />
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              At least 10 characters. Only moderators can read this. {description.length}/{MAX_DESCRIPTION}
            </p>
          </div>

          {error ? <p className={errorClass}>{error}</p> : null}
          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading ? "Submitting..." : "Submit report"}
          </button>
        </form>
      )}
    </AppShell>
  );
}