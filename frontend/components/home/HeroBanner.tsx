export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-indigo-50 px-5 py-7 sm:px-8 sm:py-9 dark:bg-indigo-500/10">
      <div className="relative z-10 max-w-xl">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          Check. Report.{" "}
          <span className="relative inline-block text-indigo-700 dark:text-indigo-400">
            Stay Safe.
            <svg
              viewBox="0 0 180 12"
              className="absolute -bottom-2 left-0 h-3 w-full text-indigo-700 dark:text-indigo-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              aria-hidden="true"
              preserveAspectRatio="none"
            >
              <path d="M2 8c30-6 60-6 90-3s55 2 86-2" />
            </svg>
          </span>
        </h1>
        <p className="mt-4 text-slate-700 dark:text-slate-300">
          Verify suspicious numbers, accounts and links with our community.
        </p>
      </div>

      {/* Decorative phone with a warning sign */}
      <svg
        viewBox="0 0 260 160"
        className="absolute right-0 top-0 hidden h-full w-auto md:block"
        aria-hidden="true"
      >
        <circle cx="190" cy="120" r="75" className="fill-indigo-100 dark:fill-indigo-500/15" />
        <g stroke="currentColor" strokeWidth={3} strokeLinecap="round" className="text-slate-700 dark:text-slate-300">
          <path d="M62 36 76 46" />
          <path d="M56 56h16" />
          <path d="M66 76l12-8" />
        </g>
        <g transform="rotate(8 150 80)">
          <rect x="105" y="-14" width="92" height="190" rx="16" className="fill-slate-900 dark:fill-slate-950" />
          <rect x="111" y="-8" width="80" height="178" rx="11" className="fill-slate-800 dark:fill-slate-900" />
          <path
            d="M151 52 177 100H125z"
            fill="none"
            strokeWidth={5}
            strokeLinejoin="round"
            className="stroke-red-500"
          />
          <path d="M151 70v16" strokeWidth={5} strokeLinecap="round" className="stroke-red-500" />
          <circle cx="151" cy="93" r="2.8" className="fill-red-500" />
        </g>
      </svg>
    </section>
  );
}