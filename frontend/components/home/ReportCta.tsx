import Link from "next/link";

import { ArrowRightIcon, FlagIcon } from "@/components/ui/icons";

export default function ReportCta() {
  return (
    <section className="rounded-3xl bg-indigo-50 p-6 text-center dark:bg-indigo-500/10">
      <FlagIcon className="mx-auto h-8 w-8 text-indigo-700 dark:text-indigo-400" />
      <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">Report a Scam</h2>
      <p className="mt-1 text-slate-600 dark:text-slate-300">Help others by sharing suspicious reports.</p>
      <Link
        href="#"
        className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 font-semibold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
      >
        Report Now <ArrowRightIcon className="h-5 w-5" />
      </Link>
    </section>
  );
}
