import { create } from "zustand";
import { persist } from "zustand/middleware";

import { THEME_STORAGE_KEY } from "@/lib/constants";

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: THEME_STORAGE_KEY }, // saved in localStorage so the choice survives a refresh
  ),
);
