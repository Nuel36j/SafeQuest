"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { getErrorMessage, setUserActive } from "@/lib/api";
import { cardClass, errorClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass, successClass } from "@/lib/styles";

// The backend bans by numeric user ID.
export default function UserModeration() {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function apply(isActive: boolean) {
    setError(null);
    setMessage(null);
    const id = Number(userId);
    if (!Number.isInteger(id) || id < 1) {
      setError("Enter a valid user ID (a whole number).");
      return;
    }
    if (!isActive && !window.confirm(`Ban user ${id}? Their reports will stop counting.`)) return;

    setLoading(true);
    try {
      const user = await setUserActive(id, isActive);
      setMessage(`${user.handle} is now ${user.is_active ? "active" : "banned"}.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <form onSubmit={handleSubmit} className={`${cardClass} max-w-md space-y-4`}>
      <div>
        <label htmlFor="userId" className={labelClass}>
          User ID
        </label>
        <input
          id="userId"
          inputMode="numeric"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="e.g. 12"
          className={inputClass}
        />
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          The numeric ID, not the username. Banned users&apos; reports stop counting toward scores.
        </p>
      </div>
      {error ? <p className={errorClass}>{error}</p> : null}
      {message ? <p className={successClass}>{message}</p> : null}
      <div className="flex gap-3">
        <button type="button" disabled={loading} onClick={() => apply(false)} className={primaryButtonClass}>
          Ban
        </button>
        <button type="button" disabled={loading} onClick={() => apply(true)} className={secondaryButtonClass}>
          Unban
        </button>
      </div>
    </form>
  );
}