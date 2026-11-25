// Shared Tailwind class strings for the forms and cards on the new pages.

export const cardClass =
  "rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900";

export const labelClass = "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300";

export const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400";

export const primaryButtonClass =
  "rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClass =
  "rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";

export const errorClass =
  "rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300";

export const successClass =
  "rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";

// Pill buttons used for tabs and type pickers. Same look as the tabs on the Home feed.
export function pillClass(active: boolean): string {
  return `rounded-full px-5 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
    active
      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
  }`;
}