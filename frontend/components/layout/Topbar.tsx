"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import { BellIcon, ChevronDownIcon, SearchIcon, ShieldBoltIcon } from "@/components/ui/icons";
import { guessIdentifierType } from "@/lib/identifier";
import { useAuthStore } from "@/store/authStore";

import ThemeToggle from "./ThemeToggle";

const menuItemClass =
  "block w-full rounded-xl px-3 py-2 text-left text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-slate-200 dark:hover:bg-slate-800";

export default function Topbar() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [shortcut, setShortcut] = useState("Ctrl K");
  // The saved login only exists in the browser, so the account area waits until after the first render.
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setShortcut("⌘ K");

    // Ctrl+K (Cmd+K on a Mac) jumps to the search box.
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // While the account menu is open: close it on a click outside or on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    function onClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Sends the search to the Explore page, which runs it.
  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = query.trim();
    if (text.length < 3) return;
    router.push(`/explore?type=${guessIdentifierType(text)}&q=${encodeURIComponent(text)}`);
  }

  function handleLogout() {
    logout();
    setMenuOpen(false);
    router.replace("/login");
  }

  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 pb-2 pt-4 sm:px-6 sm:pt-6">
      {/* Below lg the sidebar (and its logo) is hidden, so the logo moves here. */}
      <div className="order-1 flex items-center gap-2 lg:hidden">
        <ShieldBoltIcon className="h-8 w-8 text-indigo-700 dark:text-indigo-400" />
        <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Safe<span className="text-indigo-700 dark:text-indigo-400">Quest</span>
        </span>
      </div>

      <form
        onSubmit={handleSearch}
        role="search"
        className="order-3 flex h-12 w-full items-center gap-3 rounded-full border border-slate-200 bg-white px-5 focus-within:outline-2 focus-within:outline-indigo-500 dark:border-slate-800 dark:bg-slate-900 lg:order-1 lg:w-auto lg:flex-1"
      >
        <SearchIcon className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" />
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search phone number, account number or URL..."
          aria-label="Search phone number, account number or URL"
          className="min-w-0 flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-500 dark:text-slate-100 dark:placeholder:text-slate-400"
        />
        <kbd className="hidden rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400 sm:block">
          {shortcut}
        </kbd>
      </form>

      <div className="order-2 ml-auto flex items-center gap-1 lg:order-2 lg:ml-0 xl:w-[340px] xl:justify-end">
        <ThemeToggle />

        <Link
          href="/notifications"
          aria-label="Notifications"
          className="flex h-11 w-11 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <BellIcon className="h-6 w-6" />
        </Link>

        {mounted && token ? (
          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-500 dark:hover:bg-slate-800"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-base font-bold text-white"
                aria-hidden="true"
              >
                {user ? user.handle.slice(0, 1).toUpperCase() : ""}
              </span>
              <ChevronDownIcon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            </button>

            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-full z-40 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900"
              >
                {user ? (
                  <p className="truncate px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white">{user.handle}</p>
                ) : null}
                <Link role="menuitem" href="/profile" onClick={() => setMenuOpen(false)} className={menuItemClass}>
                  Profile
                </Link>
                <button type="button" role="menuitem" onClick={handleLogout} className={menuItemClass}>
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {mounted && !token ? (
          <Link
            href="/login"
            className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            Log in
          </Link>
        ) : null}
      </div>
    </header>
  );
}