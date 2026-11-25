"use client";

import { useEffect, useState } from "react";

import { getErrorMessage, listAuditLogs } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { cardClass, errorClass } from "@/lib/styles";
import type { AuditLog as AuditLogEntry } from "@/types/api";

import Pager from "./Pager";

const PAGE_SIZE = 50;

export default function AuditLog() {
  const [skip, setSkip] = useState(0);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listAuditLogs(skip, PAGE_SIZE)
      .then((data) => {
        if (!cancelled) setLogs(data);
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
  }, [skip]);

  return (
    <div>
      {error ? <p className={errorClass}>{error}</p> : null}
      {loading ? <p className="text-slate-600 dark:text-slate-300">Loading...</p> : null}
      {!loading && !error && logs.length === 0 ? (
        <p className="text-slate-600 dark:text-slate-300">Nothing logged yet.</p>
      ) : null}

      {logs.length > 0 ? (
        <div className={`${cardClass} overflow-x-auto p-0`}>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3 font-semibold">When</th>
                <th className="px-4 py-3 font-semibold">Admin ID</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold">Target</th>
                <th className="px-4 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 dark:text-slate-200">
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <td className="whitespace-nowrap px-4 py-3">{formatDateTime(log.created_at)}</td>
                  <td className="px-4 py-3">{log.actor_id}</td>
                  <td className="px-4 py-3 font-medium">{log.action}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {log.target_type} #{log.target_id}
                  </td>
                  <td className="px-4 py-3">{log.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <Pager skip={skip} pageSize={PAGE_SIZE} count={logs.length} onChange={setSkip} />
    </div>
  );
}