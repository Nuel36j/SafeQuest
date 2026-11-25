import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import AuthProvider from "@/components/layout/AuthProvider";
import ThemeProvider from "@/components/layout/ThemeProvider";
import { THEME_STORAGE_KEY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "SafeQuest",
  description: "Check suspicious phone numbers, accounts and links with the community.",
};

// Runs before the page paints: if dark mode was saved, add the "dark" class immediately,
// so a dark-mode user never sees a flash of the light theme on refresh.
const themeScript = `(function(){try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");if(s&&JSON.parse(s).state.theme==="dark"){document.documentElement.classList.add("dark");}}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: the script above may add "dark" to <html> before React loads.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}