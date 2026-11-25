const TONES = ["bg-indigo-500", "bg-rose-500", "bg-teal-500"];

// Initial-letter avatar. Accounts are anonymous, so there are no profile photos.
export default function Avatar({ name, tone = 0 }: { name: string; tone?: number }) {
  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${TONES[tone % TONES.length]}`}
      aria-hidden="true"
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}
