import type { Metadata } from "next";
import AdminPage from "./admin";

export const metadata: Metadata = {
  title: "SafeQuest-Admin",
  description: "Admin Panel",
}

export default function AdminsPage() {
  return <AdminPage />;
}