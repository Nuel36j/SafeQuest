"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { cardClass, primaryButtonClass, secondaryButtonClass } from "@/lib/styles";
import { useAuthStore } from "@/store/authStore";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface AppShellProps {
  children: ReactNode;
  requireAuth?: boolean; // default true: logged-out visitors are sent to /login
  adminOnly?: boolean; // default false: only admins may see the page
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-slate-600 dark:text-slate-300">
      {children}
    </div>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-4xl p-4 pb-24 sm:p-6 sm:pb-24 lg:pb-6">{children}</main>
      </div>
    </div>
  );
}

// The sidebar + top bar around a page, plus the login check.
export default function AppShell({ children, requireAuth = true, adminOnly = false }: AppShellProps) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const userError = useAuthStore((state) => state.userError);
  const setUserError = useAuthStore((state) => state.setUserError);

  // The saved token only exists in the browser, so wait for the first client render
  // before deciding anything. Otherwise the server and browser would disagree.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && requireAuth && !token) router.replace("/login");
  }, [mounted, requireAuth, token, router]);

  if (!mounted || (requireAuth && !token)) {
    return <Centered>Loading...</Centered>;
  }

  if (requireAuth && token && !user) {
    if (userError) {
      return (
        <Centered>
          <p>Can&apos;t load your account. Is the backend running?</p>
          <button type="button" onClick={() => setUserError(false)} className={primaryButtonClass}>
            Try again
          </button>
        </Centered>
      );
    }
    return <Centered>Loading...</Centered>;
  }

  if (adminOnly && user?.role !== "admin") {
    return (
      <Frame>
        <div className={cardClass}>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admins only</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">You don&apos;t have access to this page.</p>
        </div>
      </Frame>
    );
  }

  return (
    <Frame>
      {!token ? (
        <div className={`${cardClass} mb-6 flex flex-wrap items-center gap-4`}>
          <p className="flex-1 text-slate-700 dark:text-slate-300">
            Log in or create an account to report scams.
          </p>
          <Link href="/login" className={primaryButtonClass}>
            Log in
          </Link>
          <Link href="/register" className={secondaryButtonClass}>
            Create account
          </Link>
        </div>
      ) : null}
      {children}
    </Frame>
  );
}