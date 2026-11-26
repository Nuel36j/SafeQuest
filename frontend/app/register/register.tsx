"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";

import AuthCard from "@/components/auth/AuthCard";
import { getErrorMessage, login, register } from "@/lib/api";
import {
  errorClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/lib/styles";
import { useAuthStore } from "@/store/authStore";

export default function RegisterPage() {
  const token = useAuthStore((state) => state.token);
  const setToken = useAuthStore((state) => state.setToken);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUsername, setCreatedUsername] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
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
      const user = await register(username, password);
      setCreatedUsername(user.handle);
      try {
        const result = await login(user.handle, password);
        setToken(result.access_token);
      } catch {
        // Account exists. The user can log in manually from the next screen.
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function copyUsername() {
    if (!createdUsername) return;
    try {
      await navigator.clipboard.writeText(createdUsername);
      setCopied(true);
    } catch {
      // Clipboard blocked. The username is on screen to copy by hand.
    }
  }

  if (createdUsername) {
    return (
      <AuthCard title="Account created">
        <p className="break-all rounded-2xl bg-indigo-50 px-4 py-4 text-center text-2xl font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
          {createdUsername}
        </p>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          SafeQuest doesn&apos;t collect an email or phone number, so a lost username or password can&apos;t be
          recovered.
        </p>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={copyUsername} className={`${secondaryButtonClass} flex-1`}>
            {copied ? "Copied" : "Copy username"}
          </button>
          <Link href={token ? "/" : "/login"} className={`${primaryButtonClass} flex-1 text-center`}>
            Continue
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create an account" subtitle="Do not use a name that identifies you. Anonymity is important.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className={labelClass}>
            Username
          </label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            className={inputClass}
          />
        </div>
  
        <div>
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
            className={inputClass}
          />
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">At least 8 characters.</p>
        </div>
        <div>
          <label htmlFor="confirm" className={labelClass}>
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            className={inputClass}
          />
        </div>
        {error ? <p className={errorClass}>{error}</p> : null}
        <button type="submit" disabled={loading} className={`${primaryButtonClass} w-full`}>
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
      <p className="mt-5 text-center text-slate-600 dark:text-slate-300">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-indigo-700 hover:underline dark:text-indigo-400">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
