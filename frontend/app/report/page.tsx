import type { Metadata } from "next";
import ReportPage from "./reports";

export const metadata: Metadata = {
  title: "SafeQuest-Report",
  description: "Report a scam to help others stay safe",
}

export default function ReportsPage() {
  return <ReportPage />;
}