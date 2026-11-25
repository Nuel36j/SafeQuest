import type { Metadata } from "next";
import NotificationsPage from "./notifications";

export const metadata: Metadata = {
  title: "SafeQuest-Notifications",
  description: "Your notifications",
}

export default function NotificationPage() {
  return <NotificationsPage />;
}