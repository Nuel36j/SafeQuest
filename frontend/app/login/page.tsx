import type { Metadata } from "next";
import LoginPage from "./login";

export const metadata: Metadata = {
  title: "SafeQuest-Login",
  description: "Log in to your account",
}

export default function Page() {
  return <LoginPage />;
}