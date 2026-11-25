import type { Metadata } from "next";
import ExplorePage from "./explore";

export const metadata: Metadata = {
  title: "SafeQuest-Explore",
  description: "Explore Content",
}

export default function ExploresPage() {
  return <ExplorePage />;
}