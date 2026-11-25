import AppShell from "@/components/layout/AppShell";
import { BellIcon } from "@/components/ui/icons";
import { cardClass } from "@/lib/styles";

// The backend has no notifications endpoint yet, so this page is an empty state for now.
export default function NotificationsPage() {
  return (
    <AppShell>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Notifications</h1>
      <div className={`${cardClass} mt-6 flex flex-col items-center py-14 text-center`}>
        <BellIcon className="h-10 w-10 text-slate-400 dark:text-slate-500" />
        <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No notifications yet</p>
        <p className="mt-1 text-slate-600 dark:text-slate-300">When there&apos;s something new, it will show up here.</p>
      </div>
    </AppShell>
  );
}