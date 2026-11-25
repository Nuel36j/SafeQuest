"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

import AppShell from "@/components/layout/AppShell";
import Avatar from "@/components/ui/Avatar";
import { changePassword, getErrorMessage } from "@/lib/api";
import {
  cardClass,
  errorClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
  successClass,
} from "@/lib/styles";
import { useAuthStore } from "@/store/authStore";

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      await changePassword(password);
      setPassword("");
      setConfirm("");
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <AppShell>
      {user ? (
        <>
          <div className={`${cardClass} flex flex-wrap items-center gap-5`}>
            <Avatar name={user.handle} />
            <div className="min-w-0 flex-1">
              <h1 className="break-all text-2xl font-extrabold text-slate-900 dark:text-white">{user.handle}</h1>
              {user.role === "admin" ? (
                <p className="mt-1 text-sm font-semibold text-indigo-700 dark:text-indigo-400">Admin</p>
              ) : null}
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {user.reputation_score.toFixed(1)}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Trust score</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Your trust score goes up when moderators approve your reports. The higher it is, the more your
            reports count.
          </p>

          <form onSubmit={handleSubmit} className={`${cardClass} mt-6 space-y-4`}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Change password</h2>
            <div>
              <label htmlFor="newPassword" className={labelClass}>
                New password
              </label>
              <input
                id="newPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className={labelClass}>
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
                className={inputClass}
              />
            </div>
            {error ? <p className={errorClass}>{error}</p> : null}
            {saved ? <p className={successClass}>Password changed.</p> : null}
            <button type="submit" disabled={loading} className={primaryButtonClass}>
              {loading ? "Saving..." : "Change password"}
            </button>
          </form>

          <button type="button" onClick={handleLogout} className={`${secondaryButtonClass} mt-6`}>
            Log out
          </button>
        </>
      ) : null}
    </AppShell>
  );
}