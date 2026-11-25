"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

import {
  BellIcon,
  CompassIcon,
  FlagIcon,
  HomeIcon,
  ShieldBoltIcon,
  UserIcon,
} from "@/components/ui/icons";
import type { IconProps } from "@/components/ui/icons";
import { useAuthStore } from "@/store/authStore";

interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<IconProps>;
}

// Outline shield for the Admin link.
function ShieldIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

const NAV: NavItem[] = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Explore", href: "/explore", icon: CompassIcon },
  { label: "Report", href: "/report", icon: FlagIcon },
  { label: "Notifications", href: "/notifications", icon: BellIcon },
  { label: "Profile", href: "/profile", icon: UserIcon },
];

const ADMIN_ITEM: NavItem = { label: "Admin", href: "/admin", icon: ShieldIcon };

// Hidden while the sidebar is collapsed, fades in when it opens (on hover or keyboard focus).
const REVEAL =
  "whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100";

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  // The Admin link only appears for admin accounts.
  const items = user?.role === "admin" ? [...NAV, ADMIN_ITEM] : NAV;

  function isActive(href: string): boolean {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop: a narrow icon strip that opens over the page on hover. The outer div keeps
          the strip's space in the layout, so the content never moves when it opens. */}
            {/* Desktop: the width lives on this outer div, so when it grows the page next to it
          shrinks to make room, and grows back when the sidebar collapses. */}
      <div className="group hidden w-[76px] shrink-0 transition-[width] duration-200 hover:w-[272px] focus-within:w-[272px] lg:block">
        <aside className="sticky top-0 flex h-screen w-full flex-col overflow-hidden border-r border-slate-200 bg-white px-2 py-7 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 px-2">
            <ShieldBoltIcon className="h-10 w-10 shrink-0 text-indigo-700 dark:text-indigo-400" />
            <span className={`${REVEAL} text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white`}>
              Safe<span className="text-indigo-700 dark:text-indigo-400">Quest</span>
            </span>
          </div>

          <nav aria-label="Main" className="mt-9 flex flex-col gap-1.5">
            {items.map(({ label, href, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-4 rounded-2xl px-4 py-3.5 text-lg focus-visible:outline-2 focus-visible:outline-indigo-500 ${
                    active
                      ? "bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="h-6 w-6 shrink-0" />
                  <span className={`${REVEAL} flex-1`}>{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex items-center gap-4 rounded-2xl bg-indigo-50 p-2 dark:bg-indigo-500/10">
            <ShieldBoltIcon className="h-10 w-10 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <p className={`${REVEAL} font-medium leading-snug text-slate-700 dark:text-slate-200`}>
              Stay alert.
              <br />
              Share the truth.
            </p>
          </div>
        </aside>
      </div>

      {/* Phones and tablets: the sidebar is hidden, so the same links sit in a bar at the bottom. */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 flex border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:hidden"
      >
        {items.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium focus-visible:outline-2 focus-visible:outline-indigo-500 ${
                active ? "text-indigo-700 dark:text-indigo-300" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="max-w-full truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}