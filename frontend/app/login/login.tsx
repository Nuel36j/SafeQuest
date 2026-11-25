"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import AuthCard from "@/components/auth/AuthCard";
import { getErrorMessage, login } from "@/lib/api";
import { errorClass, inputClass, labelClass, primaryButtonClass } from "@/lib/styles";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const setToken = useAuthStore((state) => state.setToken);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already logged in? Go to the dashboard.
  useEffect(() => {
    if (token) router.replace("/");
  }, [token, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await login(username.trim(), password);
      setToken(result.access_token);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Log in" subtitle="Use the username and password you registered with.">
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
            autoComplete="current-password"
            required
            className={inputClass}
          />
        </div>
        {error ? <p className={errorClass}>{error}</p> : null}
        <button type="submit" disabled={loading} className={`${primaryButtonClass} w-full`}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="mt-5 text-center text-slate-600 dark:text-slate-300">
        New here?{" "}
        <Link href="/register" className="font-semibold text-indigo-700 hover:underline dark:text-indigo-400">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}