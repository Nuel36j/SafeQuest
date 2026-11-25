import type { Metadata } from "next";
import RegisterPage from "./register";

export const metadata: Metadata = {
  title: "SafeQuest-Register",
  description: "Register for an account",
}

export default function Page() {
  return <RegisterPage />;
}