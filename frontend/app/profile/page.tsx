import type { Metadata } from "next";
import ProfilePage from "./profile";

export const metadata: Metadata = {
  title: "SafeQuest-Profile",
  description: "Profile Info",
}

export default function Page() {
  return <ProfilePage />;
}