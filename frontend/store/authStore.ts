import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User } from "@/types/api";

interface AuthState {
  token: string | null;
  user: User | null;
  userError: boolean; // true when /users/me failed for a reason other than "not logged in"
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setUserError: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      userError: false,
      setToken: (token) => set({ token, user: null, userError: false }),
      setUser: (user) => set({ user }),
      setUserError: (userError) => set({ userError }),
      logout: () => set({ token: null, user: null, userError: false }),
    }),
    {
      name: "safequest-auth",
      // Only the token is saved. The user is re-fetched from the backend on each visit.
      partialize: (state) => ({ token: state.token }),
    },
  ),
);