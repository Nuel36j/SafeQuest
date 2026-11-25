"use client";

import { useEffect, useState } from "react";

import { getErrorMessage, listAdminReports, reviewReport } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { IDENTIFIER_TYPE_LABELS, scamTypeLabel } from "@/lib/labels";
import { cardClass, errorClass, pillClass, primaryButtonClass, secondaryButtonClass } from "@/lib/styles";
import type { AdminReport, ReportStatus } from "@/types/api";

import Pager from "./Pager";

const PAGE_SIZE = 50;
const STATUSES: ReportStatus[] = ["pending", "approved", "rejected"];

export default function ReviewQueue() {
  const [status, setStatus] = useState<ReportStatus>("pending");
  const [skip, setSkip] = useState(0);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listAdminReports(status, skip, PAGE_SIZE)
      .then((data) => {
        if (!cancelled) setReports(data);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status, skip]);

  function changeStatus(next: ReportStatus) {
    setStatus(next);
    setSkip(0);
  }

  async function review(id: number, decision: "approved" | "rejected") {
    setBusyId(id);
    setError(null);
    try {
      await reviewReport(id, decision);
      // A reviewed report always leaves the current list (its status just changed).
      setReports((current) => current.filter((report) => report.id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3" role="group" aria-label="Report status">
        {STATUSES.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={status === option}
            onClick={() => changeStatus(option)}
            className={`${pillClass(status === option)} capitalize`}
          >
            {option}
          </button>
        ))}
      </div>

      {error ? <p className={`${errorClass} mt-4`}>{error}</p> : null}
      {loading ? <p className="mt-6 text-slate-600 dark:text-slate-300">Loading...</p> : null}
      {!loading && reports.length === 0 ? (
        <p className="mt-6 text-slate-600 dark:text-slate-300">No {status} reports.</p>
      ) : null}

      <ul className="mt-6 space-y-4">
        {reports.map((report) => (
          <li key={report.id} className={cardClass}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {IDENTIFIER_TYPE_LABELS[report.identifier_type]}
                </p>
                <p className="break-all text-lg font-bold text-slate-900 dark:text-white">
                  {report.identifier_value}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                {scamTypeLabel(report.scam_type)}
              </span>
            </div>

            <p className="mt-3 whitespace-pre-wrap break-words text-slate-800 dark:text-slate-200">
              {report.description}
            </p>

            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              {report.reporter_handle} · trust score {report.reporter_reputation.toFixed(1)} ·{" "}
              {formatDateTime(report.created_at)}
            </p>

            <div className="mt-4 flex gap-3">
              {report.status !== "approved" ? (
                <button
                  type="button"
                  disabled={busyId === report.id}
                  onClick={() => review(report.id, "approved")}
                  className={primaryButtonClass}
                >
                  Approve
                </button>
              ) : null}
              {report.status !== "rejected" ? (
                <button
                  type="button"
                  disabled={busyId === report.id}
                  onClick={() => review(report.id, "rejected")}
                  className={secondaryButtonClass}
                >
                  Reject
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <Pager skip={skip} pageSize={PAGE_SIZE} count={reports.length} onChange={setSkip} />
    </div>
  );
}