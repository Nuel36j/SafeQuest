"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

import { useThemeStore } from "@/store/themeStore";

// Keeps the "dark" class on <html> in sync with the zustand theme.
// Tailwind's dark: styles switch on when that class is present.
export default function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return <>{children}</>;
}
