import CheckCard from "@/components/home/CheckCard";
import HeroBanner from "@/components/home/HeroBanner";
import LiveFeed from "@/components/home/LiveFeed";
import ReportCta from "@/components/home/ReportCta";
import TrendingScamTypes from "@/components/home/TrendingScamTypes";
import TrustScoreCard from "@/components/home/TrustScoreCard";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function HomePage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="grid gap-6 p-4 pb-24 sm:p-6 sm:pb-24 lg:pb-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <HeroBanner />
            <CheckCard />
            <LiveFeed />
          </div>
          <aside className="space-y-6">
            <TrustScoreCard />
            <TrendingScamTypes />
            <ReportCta />
          </aside>
        </main>
      </div>
    </div>
  );
}